import express from 'express';
import { getShippingSettings, updateShippingSettings, calculateShipping } from '../controllers/shippingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', getShippingSettings);
router.put('/settings', protect, admin, updateShippingSettings);
router.post('/calculate', calculateShipping);

export default router;
