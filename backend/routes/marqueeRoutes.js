import express from 'express';
import {
  getMarqueeTexts,
  createMarqueeText,
  updateMarqueeText,
  deleteMarqueeText,
  reorderMarqueeTexts,
} from '../controllers/marqueeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMarqueeTexts);
router.post('/', protect, admin, createMarqueeText);
router.put('/reorder', protect, admin, reorderMarqueeTexts);
router.put('/:id', protect, admin, updateMarqueeText);
router.delete('/:id', protect, admin, deleteMarqueeText);

export default router;
