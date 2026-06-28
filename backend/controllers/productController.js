import Product from '../models/Product.js';
import { sendProductReleaseCampaign } from './newsletterController.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { category, featured, newArrival, search, recommended } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (newArrival === 'true') query.newArrival = true;
    if (recommended === 'true') query.recommended = true;
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }
    
    const products = await Product.find(query).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name, price, description, category, featured, newArrival, stock,
      whyYoullLoveIt, perfectFor, ingredients, howToUse,
      dermatologistNotes, additionalInfo, recommended, timerEnabled,
      discountPercent, offerExpiresAt
    } = req.body;

    let cardImage = '';
    let cardHoverImage = '';
    let detailImages = [];

    if (req.files && req.files.length > 0) {
      const cardImageFile = req.files.find(f => f.fieldname === 'cardImage');
      const cardHoverImageFile = req.files.find(f => f.fieldname === 'cardHoverImage');
      const detailImageFiles = req.files.filter(f => f.fieldname === 'detailImages');
      const legacyImageFiles = req.files.filter(f => f.fieldname === 'images');

      if (cardImageFile || cardHoverImageFile || detailImageFiles.length > 0) {
        if (cardImageFile) {
          cardImage = await uploadToCloudinary(cardImageFile);
        }
        if (cardHoverImageFile) {
          cardHoverImage = await uploadToCloudinary(cardHoverImageFile);
        }
        if (detailImageFiles.length > 0) {
          detailImages = await Promise.all(
            detailImageFiles.map(file => uploadToCloudinary(file))
          );
        }
      } else if (legacyImageFiles.length > 0) {
        const allUrls = await Promise.all(
          legacyImageFiles.map(file => uploadToCloudinary(file))
        );
        cardImage = allUrls[0] || '';
        cardHoverImage = allUrls[1] || '';
        detailImages = allUrls.slice(2);
      }
    } else if (req.file) {
      cardImage = await uploadToCloudinary(req.file);
    }

    if (!cardImage) {
      return res.status(400).json({ message: 'Please upload at least 1 product image (Card Main Image)' });
    }

    const allUrls = [];
    if (cardImage) allUrls.push(cardImage);
    if (cardHoverImage) allUrls.push(cardHoverImage);
    detailImages.forEach(url => allUrls.push(url));

    const product = await Product.create({
      name,
      price,
      description,
      image: cardImage,
      images: allUrls,
      cardImage,
      cardHoverImage,
      detailImages,
      category,
      featured: featured === 'true',
      newArrival: newArrival === 'true',
      stock: stock !== undefined ? Number(stock) : 10,
      whyYoullLoveIt: whyYoullLoveIt || '',
      perfectFor: perfectFor || '',
      ingredients: ingredients || '',
      howToUse: howToUse || '',
      dermatologistNotes: dermatologistNotes || '',
      additionalInfo: additionalInfo || '',
      recommended: recommended === 'true',
      timerEnabled: timerEnabled === 'true',
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : 0,
      offerExpiresAt: offerExpiresAt || null,
    });

    if (product.newArrival) {
      await sendProductReleaseCampaign(product);
    }
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const {
      name, price, description, category, featured, newArrival, stock,
      whyYoullLoveIt, perfectFor, ingredients, howToUse,
      dermatologistNotes, additionalInfo, recommended, timerEnabled,
      discountPercent, offerExpiresAt
    } = req.body;
    
    const wasNewArrival = product.newArrival;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.featured = featured !== undefined ? featured === 'true' : product.featured;
    product.newArrival = newArrival !== undefined ? newArrival === 'true' : product.newArrival;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    
    if (whyYoullLoveIt !== undefined) product.whyYoullLoveIt = whyYoullLoveIt;
    if (perfectFor !== undefined) product.perfectFor = perfectFor;
    if (ingredients !== undefined) product.ingredients = ingredients;
    if (howToUse !== undefined) product.howToUse = howToUse;
    if (dermatologistNotes !== undefined) product.dermatologistNotes = dermatologistNotes;
    if (additionalInfo !== undefined) product.additionalInfo = additionalInfo;
    if (recommended !== undefined) product.recommended = recommended === 'true';
    if (timerEnabled !== undefined) product.timerEnabled = timerEnabled === 'true';
    if (discountPercent !== undefined) product.discountPercent = Number(discountPercent) || 0;
    if (offerExpiresAt !== undefined) product.offerExpiresAt = offerExpiresAt || null;
    
    if (req.files && req.files.length > 0) {
      const cardImageFile = req.files.find(f => f.fieldname === 'cardImage');
      const cardHoverImageFile = req.files.find(f => f.fieldname === 'cardHoverImage');
      const detailImageFiles = req.files.filter(f => f.fieldname === 'detailImages');
      const legacyImageFiles = req.files.filter(f => f.fieldname === 'images');

      if (cardImageFile || cardHoverImageFile || detailImageFiles.length > 0) {
        if (cardImageFile) {
          product.cardImage = await uploadToCloudinary(cardImageFile);
          product.image = product.cardImage;
        }
        if (cardHoverImageFile) {
          product.cardHoverImage = await uploadToCloudinary(cardHoverImageFile);
        }
        if (detailImageFiles.length > 0) {
          product.detailImages = await Promise.all(
            detailImageFiles.map(file => uploadToCloudinary(file))
          );
        }
      } else if (legacyImageFiles.length > 0) {
        const allUrls = await Promise.all(
          legacyImageFiles.map(file => uploadToCloudinary(file))
        );
        product.cardImage = allUrls[0] || product.cardImage;
        product.cardHoverImage = allUrls[1] || product.cardHoverImage;
        product.detailImages = allUrls.slice(2).length > 0 ? allUrls.slice(2) : product.detailImages;
        product.image = product.cardImage;
      }

      // Sync the images array
      const allUrls = [];
      if (product.cardImage) allUrls.push(product.cardImage);
      if (product.cardHoverImage) allUrls.push(product.cardHoverImage);
      if (product.detailImages && product.detailImages.length > 0) {
        product.detailImages.forEach(url => allUrls.push(url));
      }
      product.images = allUrls;
    } else if (req.file) {
      product.cardImage = await uploadToCloudinary(req.file);
      product.image = product.cardImage;
      
      const allUrls = [];
      if (product.cardImage) allUrls.push(product.cardImage);
      if (product.cardHoverImage) allUrls.push(product.cardHoverImage);
      if (product.detailImages && product.detailImages.length > 0) {
        product.detailImages.forEach(url => allUrls.push(url));
      }
      product.images = allUrls;
    }
    
    const updatedProduct = await product.save();

    if (updatedProduct.newArrival && !wasNewArrival) {
      await sendProductReleaseCampaign(updatedProduct);
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
