import mongoose from 'mongoose';

const marqueeTextSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const MarqueeText = mongoose.model('MarqueeText', marqueeTextSchema);
export default MarqueeText;
