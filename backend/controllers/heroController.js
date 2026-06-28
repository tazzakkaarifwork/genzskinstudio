import Hero from '../models/Hero.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get hero content
export const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create({});
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update hero text content (no images)
export const updateHero = async (req, res) => {
  try {
    const { tagline, titleLine1, titleLine2Outline, titleLine3, subtitle, buttonText } = req.body;
    let hero = await Hero.findOne();
    if (!hero) {
      hero = new Hero();
    }

    hero.tagline = tagline !== undefined ? tagline : hero.tagline;
    hero.titleLine1 = titleLine1 !== undefined ? titleLine1 : hero.titleLine1;
    hero.titleLine2Outline = titleLine2Outline !== undefined ? titleLine2Outline : hero.titleLine2Outline;
    hero.titleLine3 = titleLine3 !== undefined ? titleLine3 : hero.titleLine3;
    hero.subtitle = subtitle !== undefined ? subtitle : hero.subtitle;
    hero.buttonText = buttonText !== undefined ? buttonText : hero.buttonText;

    // Legacy single image support
    if (req.files && req.files.length > 0) {
      const uploadedUrls = await Promise.all(req.files.map(f => uploadToCloudinary(f)));
      hero.bannerImages = [...(hero.bannerImages || []), ...uploadedUrls];
    } else if (req.file) {
      const url = await uploadToCloudinary(req.file);
      hero.bgImage = url;
    }

    const updatedHero = await hero.save();
    res.json(updatedHero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload new banner images (append to existing)
export const uploadBannerImages = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    const uploadedUrls = await Promise.all(req.files.map(f => uploadToCloudinary(f)));
    hero.bannerImages = [...(hero.bannerImages || []), ...uploadedUrls];

    const updated = await hero.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific banner image by index
export const deleteBannerImage = async (req, res) => {
  try {
    const { index } = req.params;
    let hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ message: 'Hero not found' });

    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= (hero.bannerImages || []).length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    hero.bannerImages.splice(idx, 1);
    const updated = await hero.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload media banner (image OR video) for community section
export const uploadMediaBanner = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) hero = new Hero();

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const url = await uploadToCloudinary(req.file, resourceType);

    hero.mediaBannerType = isVideo ? 'video' : 'image';
    hero.mediaBannerUrl = url;

    const updated = await hero.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove media banner
export const removeMediaBanner = async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) return res.status(404).json({ message: 'Hero not found' });

    hero.mediaBannerType = '';
    hero.mediaBannerUrl = '';

    const updated = await hero.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
