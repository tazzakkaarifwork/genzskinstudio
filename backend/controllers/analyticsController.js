import VisitorSession from '../models/VisitorSession.js';
import Product from '../models/Product.js';

// @desc    Record or update visitor session details
// @route   POST /api/analytics/session
export const recordSessionActivity = async (req, res) => {
  try {
    const {
      sessionId,
      trafficSource,
      cartItems,
      cartTotal,
      checkoutStarted,
      checkoutStep,
      checkoutEmail,
      checkoutPhone,
      checkoutName,
      checkoutCity,
      checkoutAddress,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Check if session exists
    let session = await VisitorSession.findOne({ sessionId });

    const updateFields = {
      updatedAt: new Date(),
    };

    if (req.user) {
      updateFields.user = req.user._id;
    }

    if (trafficSource) {
      updateFields.trafficSource = {
        utm_source: trafficSource.utm_source || 'direct',
        utm_medium: trafficSource.utm_medium || 'none',
        utm_campaign: trafficSource.utm_campaign || 'none',
        referrer: trafficSource.referrer || 'none',
        landingPage: trafficSource.landingPage || '',
        fbclid: trafficSource.fbclid || '',
        ttclid: trafficSource.ttclid || '',
      };
    }

    if (cartItems !== undefined) {
      updateFields.cartItems = cartItems;
    }
    if (cartTotal !== undefined) {
      updateFields.cartTotal = cartTotal;
    }
    if (checkoutStarted !== undefined) {
      updateFields.checkoutStarted = checkoutStarted;
    }
    if (checkoutStep !== undefined) {
      updateFields.checkoutStep = checkoutStep;
    }
    if (checkoutEmail !== undefined) updateFields.checkoutEmail = checkoutEmail;
    if (checkoutPhone !== undefined) updateFields.checkoutPhone = checkoutPhone;
    if (checkoutName !== undefined) updateFields.checkoutName = checkoutName;
    if (checkoutCity !== undefined) updateFields.checkoutCity = checkoutCity;
    if (checkoutAddress !== undefined) updateFields.checkoutAddress = checkoutAddress;

    if (session) {
      session = await VisitorSession.findOneAndUpdate(
        { sessionId },
        { $set: updateFields },
        { new: true }
      );
    } else {
      // Create new session
      const newSession = {
        sessionId,
        ipAddress,
        userAgent,
        ...updateFields,
      };
      if (!newSession.trafficSource) {
        newSession.trafficSource = {
          utm_source: 'direct',
          utm_medium: 'none',
          utm_campaign: 'none',
          referrer: 'none',
          landingPage: '',
          fbclid: '',
          ttclid: '',
        };
      }
      session = await VisitorSession.create(newSession);
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real-time analytics and statistics for admin dashboard
// @route   GET /api/analytics/stats
export const getAnalyticsStats = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // 1. Live Visitors (updated in the last 5 minutes)
    const liveVisitors = await VisitorSession.countDocuments({
      updatedAt: { $gte: fiveMinutesAgo }
    });

    // 2. Total Sessions
    const totalSessions = await VisitorSession.countDocuments();

    // 3. Checkout Started sessions
    const checkoutStartedCount = await VisitorSession.countDocuments({
      checkoutStarted: true
    });

    // 4. Completed Orders count from sessions
    const completedOrdersCount = await VisitorSession.countDocuments({
      orderPlaced: true
    });

    // 5. Funnel Aggregation
    // Reached Cart = sessions with at least one item in cart OR checkoutStarted = true
    const cartAddedCount = await VisitorSession.countDocuments({
      $or: [
        { 'cartItems.0': { $exists: true } },
        { checkoutStarted: true },
        { orderPlaced: true }
      ]
    });

    // 6. Traffic Source breakdown (Group by utm_source)
    const trafficBreakdown = await VisitorSession.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$trafficSource.utm_source", "direct"] },
          sessionCount: { $sum: 1 },
          checkoutCount: {
            $sum: { $cond: [{ $eq: ["$checkoutStarted", true] }, 1, 0] }
          },
          purchaseCount: {
            $sum: { $cond: [{ $eq: ["$orderPlaced", true] }, 1, 0] }
          }
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);

    // 7. Abandoned Checkouts list (checkoutStarted = true and orderPlaced = false)
    const abandonedCheckouts = await VisitorSession.find({
      checkoutStarted: true,
      orderPlaced: false
    })
      .sort({ updatedAt: -1 })
      .limit(50); // limit to recent 50

    res.status(200).json({
      liveVisitors,
      totalSessions,
      checkoutStartedCount,
      completedOrdersCount,
      cartAddedCount,
      trafficBreakdown,
      abandonedCheckouts,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ message: error.message });
  }
};
