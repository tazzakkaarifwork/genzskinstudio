import mongoose from 'mongoose';

const shippingSettingSchema = new mongoose.Schema({
  freeCities: {
    type: [String],
    default: ['karachi'],
  },
  standardCharge: {
    type: Number,
    default: 150,
  },
  freeMatchMode: {
    type: String,
    enum: ['exact', 'includes'],
    default: 'exact',
  },
}, { timestamps: true });

const ShippingSetting = mongoose.model('ShippingSetting', shippingSettingSchema);

export default ShippingSetting;
