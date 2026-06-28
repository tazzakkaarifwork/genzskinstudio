import Wishlist from '../models/Wishlist.js';
export const getWishlist = async (req, res) => {
  const items = await Wishlist.find({ user: req.user.id }).populate('product');
  if (req.query.populate === 'true') {
    return res.json(items.map(i => i.product).filter(Boolean));
  }
  res.json(items.map(i => i.product ? i.product._id.toString() : null).filter(Boolean));
};
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const existing = await Wishlist.findOne({ user: req.user.id, product: productId });
  if (existing) return res.status(400).json({ message: 'Already in wishlist' });
  const item = await Wishlist.create({ user: req.user.id, product: productId });
  res.status(201).json(item);
};
export const removeFromWishlist = async (req, res) => {
  await Wishlist.findOneAndDelete({ user: req.user.id, product: req.params.productId });
  res.json({ message: 'Removed' });
};