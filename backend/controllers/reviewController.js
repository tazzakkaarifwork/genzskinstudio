import Product from '../models/Product.js';

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('reviews avgRating reviewsCount');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Sort reviews by newest first
    const sortedReviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);
    res.json({
      avgRating: product.avgRating,
      reviewsCount: product.reviewsCount,
      reviews: sortedReviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Add a review (guest or logged in)
// @route   POST /api/products/:id/reviews
export const addReview = async (req, res) => {
  try {
    const { rating, comment, name, email, userId } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5 || !comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Rating (1-5) and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = {
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    if (userId) {
      review.user = userId;
    } else {
      review.name = name && name.trim() ? name.trim() : 'Guest';
      if (email && email.trim()) review.email = email.trim();
    }

    product.reviews.push(review);
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.avgRating = totalRating / product.reviews.length;
    product.reviewsCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added',
      avgRating: product.avgRating,
      reviewsCount: product.reviewsCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get recent reviews across all products
// @route   GET /api/products/reviews/recent
export const getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name reviews')
      .populate('reviews.user', 'name');
    
    let allReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          _id: review._id,
          productName: product.name,
          rating: review.rating,
          comment: review.comment,
          userName: review.user?.name || review.name || 'Guest',
          createdAt: review.createdAt,
        });
      });
    });
    
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allReviews.slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all reviews across all products (Admin)
// @route   GET /api/products/reviews/all
export const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({ 'reviews.0': { $exists: true } })
      .select('name reviews')
      .populate('reviews.user', 'name email');

    let allReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          rating: review.rating,
          comment: review.comment,
          userId: review.user?._id || null,
          userName: review.user?.name || review.name || 'Guest',
          userEmail: review.user?.email || review.email || 'N/A',
          createdAt: review.createdAt,
        });
      });
    });

    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allReviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/products/:productId/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    product.reviews.splice(reviewIndex, 1);

    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.avgRating = totalRating / product.reviews.length;
      product.reviewsCount = product.reviews.length;
    } else {
      product.avgRating = 0;
      product.reviewsCount = 0;
    }

    await product.save();

    res.json({ message: 'Review deleted successfully', avgRating: product.avgRating, reviewsCount: product.reviewsCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update a review (Admin)
// @route   PUT /api/products/:productId/reviews/:reviewId
export const updateReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5 || !comment || comment.trim() === '') {
      return res.status(400).json({ error: 'Rating (1-5) and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = product.reviews.find(r => r._id.toString() === reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment.trim();

    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.avgRating = totalRating / product.reviews.length;

    await product.save();

    res.json({ message: 'Review updated successfully', review, avgRating: product.avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};