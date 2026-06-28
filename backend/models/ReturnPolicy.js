import mongoose from 'mongoose';

const returnPolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReturnPolicy = mongoose.model('ReturnPolicy', returnPolicySchema);
export default ReturnPolicy;
