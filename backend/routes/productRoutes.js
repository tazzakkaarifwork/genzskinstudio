import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import { getProductReviews, addReview, getRecentReviews, getAllReviews, deleteReview, updateReview } from '../controllers/reviewController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// ========== STATIC ROUTES (must come before dynamic :id routes) ==========
// GET /api/products/reviews/recent - get recent reviews across all products
router.get('/reviews/recent', getRecentReviews);
router.get('/reviews/all', protect, admin, getAllReviews);

// ========== PRODUCT CRUD ==========
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.any(), createProduct);
router.put('/:id', protect, admin, upload.any(), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// ========== REVIEWS NESTED ROUTES ==========
// These must come after the static '/reviews/recent' route to avoid conflict
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', addReview);
router.delete('/:productId/reviews/:reviewId', protect, admin, deleteReview);
router.put('/:productId/reviews/:reviewId', protect, admin, updateReview);

export default router;
