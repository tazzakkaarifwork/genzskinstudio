import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // logged-in user
  name: { type: String, default: 'Guest' },                     // guest name
  email: { type: String },                                       // guest email (optional)
  createdAt: { type: Date, default: Date.now },
});
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Legacy single image (backward compat)
  image: {
    type: String,
    default: '',
  },
  // Legacy images array (backward compat)
  images: {
    type: [String],
    default: [],
  },
  // NEW: Dedicated card main image (shown on product cards)
  cardImage: {
    type: String,
    default: '',
  },
  // NEW: Card hover image (shown on hover)
  cardHoverImage: {
    type: String,
    default: '',
  },
  // NEW: Detail page images (up to 5)
  detailImages: {
    type: [String],
    default: [],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  newArrival: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 10,
  },
  // ----- NEW FIELDS -----
  whyYoullLoveIt: {
    type: String,
    default: '',
  },
  perfectFor: {
    type: String,
    default: '',
  },
  ingredients: {
    type: String,
    default: '',
  },
  howToUse: {
    type: String,
    default: '',
  },
  dermatologistNotes: {
    type: String,
    default: '',
  },
  additionalInfo: {
    type: String,
    default: '',
  },
  recommended: {
    type: Boolean,
    default: false,
  },
  timerEnabled: {
    type: Boolean,
    default: false,
  },
  // ----------------------

   // ----- REVIEW FIELDS -----
  reviews: [reviewSchema],
  avgRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  
  // ----- DISCOUNT & OFFERS -----
  discountPercent: { type: Number, default: 0 },
  offerExpiresAt: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now },
});


const Product = mongoose.model('Product', productSchema);
export default Product;

