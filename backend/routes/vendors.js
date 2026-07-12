const express = require('express');
const router  = express.Router();
const Vendor  = require('../models/Vendor');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: 'approved' }).populate('owner', 'name email').sort('-totalSales');
    res.json({ success: true, vendors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Vendor dashboard stats
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const [total, active, pending, rejected, outOfStock, recentOrders] = await Promise.all([
      Product.countDocuments({ vendor: vendor._id }),
      Product.countDocuments({ vendor: vendor._id, approvalStatus: 'approved', isActive: true }),
      Product.countDocuments({ vendor: vendor._id, approvalStatus: 'pending' }),
      Product.countDocuments({ vendor: vendor._id, approvalStatus: 'rejected' }),
      Product.countDocuments({ vendor: vendor._id, stock: 0 }),
      Order.find({ 'items.vendor': vendor._id }).populate('customer', 'name email').sort('-createdAt').limit(10),
    ]);
    res.json({ success: true, vendor, stats: { total, active, pending, rejected, outOfStock }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Vendor's own products (all statuses)
router.get('/my-products', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const products = await Product.find({ vendor: vendor._id }).sort('-createdAt');
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ slug: req.params.slug }).populate('owner', 'name avatar');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const products = await Product.find({ vendor: vendor._id, isActive: true, approvalStatus: 'approved' }).sort('-createdAt').limit(20);
    res.json({ success: true, vendor, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/profile', protect, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate({ owner: req.user._id }, req.body, { new: true });
    res.json({ success: true, vendor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
