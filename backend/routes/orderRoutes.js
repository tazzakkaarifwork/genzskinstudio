import express from 'express';
import {
  createOrder,
  validateCoupons,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
  bulkDeleteOrders,
  getDailySales,
  getOrdersByDate,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// ✅ Guest checkout allowed – no protect
router.post('/', createOrder);
router.post('/validate-coupons', validateCoupons);

// ✅ Logged-in users only – unke apne orders
router.get('/myorders', protect, getMyOrders);

// ✅ Admin stats overview (MUST be registered before /:id)
router.get('/stats', protect, admin, getDashboardStats);
router.get('/daily-sales', protect, admin, getDailySales);
router.get('/by-date', protect, admin, getOrdersByDate);

// ✅ Admin bulk delete route
router.post('/bulk-delete', protect, admin, bulkDeleteOrders);

// ✅ Public route – koi bhi order ID se dekh sakta hai (tracking ke liye)
router.get('/:id', getOrderById);   // <-- protect hata diya

// ✅ Admin routes (protected)
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

export default router;