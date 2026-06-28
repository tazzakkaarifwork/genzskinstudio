import express from 'express';
import {
  getInactiveCustomers,
  sendRetentionReminder,
  sendAllRetentionReminders,
  getRetentionSettings,
  updateRetentionSettings,
  getReminderLogs,
  getPromoCodes,
  addPromoCode,
  deletePromoCode
} from '../controllers/retentionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Admin-only customer retention routes
router.get('/inactive', protect, admin, getInactiveCustomers);
router.post('/remind', protect, admin, sendRetentionReminder);
router.post('/remind-all', protect, admin, sendAllRetentionReminders);
router.get('/settings', protect, admin, getRetentionSettings);
router.put('/settings', protect, admin, updateRetentionSettings);
router.get('/logs', protect, admin, getReminderLogs);

// Promo code management
router.get('/promo-codes', protect, admin, getPromoCodes);
router.post('/promo-codes', protect, admin, addPromoCode);
router.delete('/promo-codes/:id', protect, admin, deletePromoCode);

export default router;

