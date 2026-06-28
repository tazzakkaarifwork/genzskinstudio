import express from 'express';
import {
  createReturnPolicy,
  deleteReturnPolicy,
  getReturnPolicies,
  updateReturnPolicy,
} from '../controllers/returnPolicyController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getReturnPolicies);
router.post('/', protect, admin, createReturnPolicy);
router.put('/:id', protect, admin, updateReturnPolicy);
router.delete('/:id', protect, admin, deleteReturnPolicy);

export default router;
