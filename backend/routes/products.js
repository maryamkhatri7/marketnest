const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const Vendor  = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// PUBLIC - only approved products
router.get('/', async (req, res) => {
  try {
    const { search, category, badge, sort = '-createdAt', page = 1, limit = 100, featured } = req.query;
    const query = { isActive: true, approvalStatus: 'approved' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (badge)    query.badge    = badge;
    if (featured === 'true') query.isFeatured = true;
    if (search)   query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    const total    = await Product.countDocuments(query);
    const products = await Product.find(query).populate('vendor', 'storeName slug status').sort(sort).skip((+page-1)*+limit).limit(+limit);
    const filtered = products.filter(p => p.vendor?.status === 'approved');
    res.json({ success: true, total, products: filtered });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'storeName slug description ratings totalSales');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// VENDOR adds product - starts as pending approval
router.post('/', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Vendor profile not found' });
    if (vendor?.status !== 'approved' && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Your store is not approved yet' });
    const approvalStatus = req.user.role === 'admin' ? 'approved' : 'pending';
    const product = await Product.create({ ...req.body, vendor: vendor?._id || req.body.vendor, approvalStatus });
    if (vendor) await Vendor.findByIdAndUpdate(vendor._id, { $inc: { productCount: 1 } });
    res.status(201).json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// VENDOR edits own product
router.put('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ owner: req.user._id });
      if (product.vendor.toString() !== vendor?._id.toString()) return res.status(403).json({ success: false, message: 'Not your product' });
      // Vendor edits reset to pending (unless admin is editing)
      req.body.approvalStatus = 'pending';
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// VENDOR deletes own product
router.delete('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ owner: req.user._id });
      if (product.vendor.toString() !== vendor?._id.toString()) return res.status(403).json({ success: false, message: 'Not your product' });
      await Vendor.findByIdAndUpdate(vendor._id, { $inc: { productCount: -1 } });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
