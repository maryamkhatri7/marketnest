const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const Vendor  = require('../models/Vendor');
const Review  = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// STATS
router.get('/stats', async (req, res) => {
  try {
    const [users, vendors, products, orders, revenue, pendingVendors, pendingProducts, recentOrders] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments({ status: 'approved' }),
      Product.countDocuments({ isActive: true, approvalStatus: 'approved' }),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      Vendor.countDocuments({ status: 'pending' }),
      Product.countDocuments({ approvalStatus: 'pending' }),
      Order.find().populate('customer', 'name email').sort('-createdAt').limit(10),
    ]);
    res.json({ success: true, stats: { users, vendors, products, orders, revenue: revenue[0]?.total || 0, pendingVendors, pendingProducts }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// USERS
router.get('/users', async (req, res) => {
  try {
    const query = {};
    if (req.query.role)   query.role = req.query.role;
    if (req.query.search) query.$or  = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
    const users = await User.find(query).populate('vendorProfile', 'storeName status').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin' && req.body.isActive === false) {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be suspended' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive, role: req.body.role }, { new: true });
    res.json({ success: true, user: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// VENDORS
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find(req.query.status ? { status: req.query.status } : {}).populate('owner', 'name email').sort('-createdAt');
    res.json({ success: true, vendors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/vendors/:id/status', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('owner', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    if (req.body.status === 'approved') await User.findByIdAndUpdate(vendor.owner._id, { role: 'vendor' });
    res.json({ success: true, vendor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ORDERS
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find(req.query.status ? { status: req.query.status } : {}).populate('customer', 'name email').sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PRODUCTS - GET ALL (pending + approved + rejected)
router.get('/products', async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.approvalStatus = req.query.status;
    const products = await Product.find(query).populate('vendor', 'storeName').sort('-createdAt');
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ✅ FIX 1: Admin product EDIT route (was completely missing before)
router.put('/products/:id', async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'price', 'comparePrice', 'stock', 'category', 'badge', 'thumbnail', 'isActive'];
    const update = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('vendor', 'storeName');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// APPROVE / REJECT product
router.put('/products/:id/approval', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const product = await Product.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true }).populate('vendor', 'storeName');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/reviews/:id', async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Review deleted' }); }
  catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
