import express from 'express';
import { deleteContact, getContacts, submitContact } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, admin, getContacts);
router.delete('/:id', protect, admin, deleteContact);

export default router;
