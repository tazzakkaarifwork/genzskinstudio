import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      image: String,
      quantity: Number,
    },
  ],
  contact: {
    email: { type: String, required: true },
    receiveNews: { type: Boolean, default: false },
  },
  shippingDetails: {
    country: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    postalCode: { type: String },
    phone: { type: String, required: true },
  },
  billingAddress: {
    country: String,
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    postalCode: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery',
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'delivered'],
    default: 'pending',
  },
  saveInfo: { type: Boolean, default: false },
  couponCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
export default Order;