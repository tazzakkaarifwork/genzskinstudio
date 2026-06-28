import express from 'express';
import {
  subscribeNewsletter,
  getSubscribers,
  unsubscribeNewsletter,
  sendManualCampaign,
  getCampaigns,
  deleteSubscriber,
  deleteCampaign
} from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public newsletter routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin-only newsletter routes
router.get('/subscribers', protect, admin, getSubscribers);
router.post('/campaign', protect, admin, sendManualCampaign);
router.get('/campaigns', protect, admin, getCampaigns);
router.delete('/subscribers/:id', protect, admin, deleteSubscriber);
router.delete('/campaigns/:id', protect, admin, deleteCampaign);

export default router;
