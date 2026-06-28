import express from 'express';
import { getHero, updateHero, uploadBannerImages, deleteBannerImage, uploadMediaBanner, removeMediaBanner } from '../controllers/heroController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getHero);
router.put('/', protect, admin, upload.array('bannerImages', 10), updateHero);
router.post('/banners', protect, admin, upload.array('bannerImages', 10), uploadBannerImages);
router.delete('/banners/:index', protect, admin, deleteBannerImage);
router.post('/media', protect, admin, upload.single('media'), uploadMediaBanner);
router.delete('/media', protect, admin, removeMediaBanner);

export default router;

