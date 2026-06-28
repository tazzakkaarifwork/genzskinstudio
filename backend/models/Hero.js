import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  tagline: {
    type: String,
    default: 'Est. 2025 — Skincare Reimagined',
  },
  titleLine1: {
    type: String,
    default: 'GLOW UP',
  },
  titleLine2Outline: {
    type: String,
    default: 'WITH GENZ',
  },
  titleLine3: {
    type: String,
    default: 'SKIN STUDIO',
  },
  subtitle: {
    type: String,
    default: 'Clean beauty curated for the next generation. No fluff. No toxins. Just results.',
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  // Legacy single bg image (kept for backward compat)
  bgImage: {
    type: String,
    default: '',
  },
  // NEW: Multiple banner images for slider (admin uploads)
  bannerImages: {
    type: [String],
    default: [],
  },
  // NEW: Community media banner (image or video)
  mediaBannerType: {
    type: String,
    enum: ['image', 'video', ''],
    default: '',
  },
  mediaBannerUrl: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Hero = mongoose.model('Hero', heroSchema);
export default Hero;
