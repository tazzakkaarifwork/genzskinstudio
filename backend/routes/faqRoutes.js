import express from 'express';
import { createFaq, deleteFaq, getFaqs, updateFaq } from '../controllers/faqController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFaqs);
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);

export default router;
