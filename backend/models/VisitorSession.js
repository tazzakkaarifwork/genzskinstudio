import mongoose from 'mongoose';

const visitorSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  trafficSource: {
    utm_source: { type: String, default: 'direct' },
    utm_medium: { type: String, default: 'none' },
    utm_campaign: { type: String, default: 'none' },
    referrer: { type: String, default: 'none' },
    landingPage: { type: String, default: '' },
    fbclid: { type: String, default: '' },
    ttclid: { type: String, default: '' },
  },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  
  checkoutStarted: { type: Boolean, default: false },
  checkoutStep: { 
    type: String, 
    enum: ['none', 'contact', 'shipping', 'billing', 'completed'], 
    default: 'none' 
  },
  checkoutEmail: { type: String, default: '' },
  checkoutPhone: { type: String, default: '' },
  checkoutName: { type: String, default: '' },
  checkoutCity: { type: String, default: '' },
  checkoutAddress: { type: String, default: '' },

  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],
  cartTotal: { type: Number, default: 0 },

  orderPlaced: { type: Boolean, default: false },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

visitorSessionSchema.index({ updatedAt: -1 });

const VisitorSession = mongoose.model('VisitorSession', visitorSessionSchema);
export default VisitorSession;
