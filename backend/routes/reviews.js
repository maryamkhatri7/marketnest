const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Helper to recalculate product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  if (!reviews.length) return;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, {
    'ratings.average': Math.round(avg * 10) / 10,
    'ratings.count': reviews.length,
  });
}

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find(req.query.product ? { product: req.query.product } : {})
      .populate('customer', 'name avatar').sort('-createdAt').limit(50);
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, title, body } = req.body;
    if (!product || !rating) return res.status(400).json({ success: false, message: 'Product and rating required' });
    const review = await Review.create({ product, rating, title, body, customer: req.user._id });
    await review.populate('customer', 'name avatar');
    // Update product rating
    await updateProductRating(product);
    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not your review' });
    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
