import express from 'express';
import { recordSessionActivity, getAnalyticsStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Public route to log user session visits and actions
router.post('/session', recordSessionActivity);

// Admin-only dashboard analytics route
router.get('/stats', protect, admin, getAnalyticsStats);

export default router;
