import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import retentionRoutes from './routes/retentionRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import returnPolicyRoutes from './routes/returnPolicyRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import marqueeRoutes from './routes/marqueeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();
// Start connection (cached for serverless)
connectDB();

const app = express();


// ✅ CORS - allow all (same-domain via monorepo)
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors({ origin: true, credentials: true }));

app.use(express.json());

// Ensure DB is connected before API calls (handles serverless cold start)
app.use('/api', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again.',
      error: error.message
    });
  }
});

// ✅ ROOT CHECK
app.get("/", (req, res) => {
  res.send("API is running ✅");
});


// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/retention', retentionRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/return-policies', returnPolicyRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/marquee', marqueeRoutes);

// Global Error Handler Middleware (ensures JSON response is always returned for API errors)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Local only
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;