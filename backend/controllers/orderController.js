import Order from '../models/Order.js';
import Product from '../models/Product.js';
import NewsletterSubscription from '../models/NewsletterSubscription.js';
import User from '../models/User.js';
import RetentionSettings from '../models/RetentionSettings.js';
import { sendOrderInvoiceEmail } from '../utils/invoiceEmail.js';
import { sendStatusUpdateEmail } from '../utils/statusEmail.js';
import { sendTikTokPurchaseEvent } from '../utils/tiktokEvents.js';
import { sendFacebookPurchaseEvent } from '../utils/facebookEvents.js';

// Predefined influencer coupons
const INFLUENCER_COUPONS = {
  'INFLUENCER10': 10,
  'INFLUENCER20': 20,
  'ZARA15': 15,
  'GLOW20': 20,
  'BEAUTY30': 30,
};

// @desc    Validate one or multiple coupon codes entered by client
// @route   POST /api/orders/validate-coupons
export const validateCoupons = async (req, res) => {
  try {
    const { codes } = req.body;
    if (!codes || !Array.isArray(codes)) {
      return res.status(400).json({ message: 'Invalid or missing coupon codes' });
    }

    const settings = await RetentionSettings.findOne() || { couponCode: 'GLOWBACK10', discountPercent: 10, promoCodes: [] };

    const validated = [];
    let totalDiscountPercent = 0;

    for (let code of codes) {
      code = code.trim().toUpperCase();
      if (!code) continue;

      let discount = 0;
      let type = '';

      // 1. Check retention coupon
      if (code === settings.couponCode.toUpperCase()) {
        discount = settings.discountPercent;
        type = 'retention';
      }
      // 2. Check hardcoded influencer codes
      else if (INFLUENCER_COUPONS[code] !== undefined) {
        discount = INFLUENCER_COUPONS[code];
        type = 'influencer';
      }
      // 3. Check admin-managed promo codes from DB
      else {
        const dbPromo = (settings.promoCodes || []).find(p => p.code.toUpperCase() === code);
        if (dbPromo) {
          discount = dbPromo.discountPercent;
          type = 'promo';
        }
      }

      if (discount > 0) {
        // Prevent duplicate codes
        if (!validated.some(v => v.code === code)) {
          validated.push({ code, discountPercent: discount, type });
          totalDiscountPercent += discount;
        }
      }
    }

    // Cap total discount at 50%
    if (totalDiscountPercent > 50) {
      totalDiscountPercent = 50;
    }

    res.json({
      valid: validated.length > 0,
      appliedCoupons: validated,
      totalDiscountPercent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      contact,
      shippingDetails,
      billingAddress,
      paymentMethod,
      totalPrice,
      saveInfo,
      couponCode,
      discountAmount,
    } = req.body;

    // Verify stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }
      const availableStock = typeof product.stock === 'number' ? product.stock : 0;
      const requestedQty = Number(item.quantity) || 0;
      if (availableStock < requestedQty) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${availableStock}, Requested: ${requestedQty}` 
        });
      }
    }

    // Update stock and increment salesCount
    for (const item of orderItems) {
      const requestedQty = Number(item.quantity) || 0;
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -requestedQty, salesCount: requestedQty },
      });
    }

    const userId = req.user?._id || null;

    const order = await Order.create({
      user: userId,
      orderItems,
      contact,
      shippingDetails,
      billingAddress: billingAddress || null,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      totalPrice,
      saveInfo,
      couponCode: couponCode || '',
      discountAmount: discountAmount || 0,
    });

    // Send invoice email to the customer (awaited to guarantee delivery on serverless platforms like Vercel)
    try {
      await sendOrderInvoiceEmail(order);
    } catch (err) {
      console.error(`Failed to send order invoice email for order ${order._id}:`, err);
    }

    // ✅ TikTok Server-Side Event — iOS + Ad Blockers ko bypass karta hai
    // Non-blocking: order response pe koi asar nahi
    sendTikTokPurchaseEvent(order).catch(err =>
      console.error('TikTok server event failed:', err.message)
    );

    // ✅ Facebook Conversions API (CAPI) Event
    sendFacebookPurchaseEvent(order).catch(err =>
      console.error('Facebook CAPI server event failed:', err.message)
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.json([]);
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const oldStatus = order.status;
    const newStatus = req.body.status;
    
    order.status = newStatus;
    const updated = await order.save();
    
    // Send email to customer on status change to dispatched or delivered (awaited for serverless reliability)
    if (oldStatus !== newStatus && (newStatus === 'dispatched' || newStatus === 'delivered')) {
      try {
        await sendStatusUpdateEmail(updated);
      } catch (err) {
        console.error(`Failed to send order status update email for order ${order._id}:`, err);
      }
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & analytics for Admin overview
// @route   GET /api/orders/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const subscribersCount = await NewsletterSubscription.countDocuments({ active: true });
    const usersCount = await User.countDocuments({ role: 'user' });

    // Status counts
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const statusCounts = { pending: 0, dispatched: 0, delivered: 0 };
    statusData.forEach(item => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Aggregate gross revenue (all orders)
    const grossRevenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    const grossRevenue = grossRevenueData.length > 0 ? grossRevenueData[0].totalRevenue : 0;

    // Aggregate net profit (delivered orders only)
    const netProfitData = await Order.aggregate([
      {
        $match: { status: 'delivered' }
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalPrice" }
        }
      }
    ]);
    const netProfit = netProfitData.length > 0 ? netProfitData[0].totalProfit : 0;
    const totalRevenue = netProfit; // keep for backward compatibility
    
    // Average Order Value based on delivered orders
    const deliveredCount = statusCounts.delivered || 0;
    const aov = deliveredCount > 0 ? netProfit / deliveredCount : 0;

    // Revenue by status
    const revenueByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        }
      }
    ]);
    const revenueBreakdown = { pending: { total: 0, count: 0 }, dispatched: { total: 0, count: 0 }, delivered: { total: 0, count: 0 } };
    revenueByStatus.forEach(item => {
      if (revenueBreakdown[item._id]) {
        revenueBreakdown[item._id] = { total: item.total, count: item.count };
      }
    });

    // Aggregate monthly data (all months for current year)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status"
          },
          totalAmount: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = monthNames.map((name, index) => {
      const monthNum = index + 1;
      const monthItems = monthlyData.filter(item => item._id.month === monthNum);

      let revenue = 0;
      let profit = 0;
      let count = 0; // delivered orders count
      let totalOrders = 0;

      monthItems.forEach(item => {
        revenue += item.totalAmount;
        totalOrders += item.count;
        if (item._id.status === 'delivered') {
          profit = item.totalAmount;
          count = item.count;
        }
      });

      return {
        month: `${name} ${currentYear}`,
        revenue,      // Gross Revenue
        profit,       // Net Profit (Delivered orders only)
        count,        // Delivered count
        totalOrders   // Total orders count
      };
    });

    // Recent 5 orders populated with user and items
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      productsCount,
      subscribersCount,
      usersCount,
      totalRevenue,
      grossRevenue,
      netProfit,
      aov,
      statusCounts,
      revenueBreakdown,
      monthlyRevenue,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk delete orders (Admin)
// @route   POST /api/orders/bulk-delete
export const bulkDeleteOrders = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No order IDs provided for bulk deletion' });
    }

    const result = await Order.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${result.deletedCount} orders.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily sales statistics (Admin)
// @route   GET /api/orders/daily-sales
export const getDailySales = async (req, res) => {
  try {
    const { month, year } = req.query; // optional month (1-12) and year (e.g. 2026)
    
    let matchQuery = {};
    if (month && year) {
      const m = parseInt(month) - 1; // 0-indexed for Date
      const y = parseInt(year);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0, 23, 59, 59);
      matchQuery.createdAt = { $gte: start, $lte: end };
    } else if (year) {
      const y = parseInt(year);
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59);
      matchQuery.createdAt = { $gte: start, $lte: end };
    }

    const dailySalesData = await Order.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalOrders: { $sum: 1 },
          grossSales: { $sum: "$totalPrice" },
          deliveredSales: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$totalPrice", 0]
            }
          },
          deliveredCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0]
            }
          },
          pendingSales: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$totalPrice", 0]
            }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
            }
          },
          dispatchedSales: {
            $sum: {
              $cond: [{ $eq: ["$status", "dispatched"] }, "$totalPrice", 0]
            }
          },
          dispatchedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "dispatched"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 }
      }
    ]);

    const formattedData = dailySalesData.map(item => {
      const dateStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      return {
        date: dateStr,
        totalOrders: item.totalOrders,
        grossSales: item.grossSales,
        deliveredSales: item.deliveredSales,
        deliveredCount: item.deliveredCount,
        pendingSales: item.pendingSales,
        pendingCount: item.pendingCount,
        dispatchedSales: item.dispatchedSales,
        dispatchedCount: item.dispatchedCount
      };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get individual orders for a specific date (Admin)
// @route   GET /api/orders/by-date
export const getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query; // format YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    // Create start and end of the day in local/system time
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    })
    .populate('user', 'firstName lastName email')
    .populate('orderItems.product');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};