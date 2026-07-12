// routes/cart.js
const express = require('express');
const router  = express.Router();
const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('customer'), async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate('items.product', 'name thumbnail price stock isActive');
    if (!cart) cart = { customer: req.user._id, items: [] };
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/add', protect, authorize('customer'), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not available' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Not enough stock' });
    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) cart = await Cart.create({ customer: req.user._id, items: [] });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx >= 0) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, vendor: product.vendor, name: product.name, thumbnail: product.thumbnail, price: product.price, quantity });
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/update', protect, authorize('customer'), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx < 0) return res.status(404).json({ success: false, message: 'Item not in cart' });
    if (quantity <= 0) cart.items.splice(idx, 1);
    else cart.items[idx].quantity = quantity;
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/remove/:productId', protect, authorize('customer'), async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/clear', protect, authorize('customer'), async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user._id });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
