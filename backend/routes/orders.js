const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Vendor  = require('../models/Vendor');
const Cart    = require('../models/Cart');
const { protect, authorize } = require('../middleware/auth');
const email   = require('../utils/email');

router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items in order' });
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const p = await Product.findById(item.product).populate('vendor');
      if (!p) return res.status(404).json({ success: false, message: `Product not found` });
      if (p.stock < item.quantity) return res.status(400).json({ success: false, message: `Not enough stock for ${p.name}` });
      orderItems.push({ product: p._id, vendor: p.vendor._id, name: p.name, thumbnail: p.thumbnail, price: p.price, quantity: item.quantity });
      subtotal += p.price * item.quantity;
      await Product.findByIdAndUpdate(p._id, { $inc: { stock: -item.quantity } });
    }
    const shipping = subtotal >= 3000 ? 0 : 200;
    const tax      = Math.round(subtotal * 0.05);
    const total    = subtotal + shipping + tax;
    const order    = await Order.create({
      customer: req.user._id, items: orderItems, shippingAddress,
      payment: { method: paymentMethod },
      pricing: { subtotal, shipping, tax, total },
      status: 'confirmed',
      trackingHistory: [{ status: 'confirmed', description: 'Order placed and confirmed' }],
    });
    await Cart.findOneAndDelete({ customer: req.user._id });
    for (const i of orderItems) await Vendor.findByIdAndUpdate(i.vendor, { $inc: { totalSales: i.quantity, totalRevenue: i.price * i.quantity } });
    email.sendOrderConfirm(order, req.user);
    res.status(201).json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'customer' ? { customer: req.user._id } : {};
    if (req.query.status) query.status = req.query.status;
    const orders = await Order.find(query).populate('items.product', 'name thumbnail').sort('-createdAt').limit(50);
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone').populate('items.product', 'name thumbnail price').populate('items.vendor', 'storeName');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your order' });
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/status', protect, authorize('admin', 'vendor'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = req.body.status;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.status === 'delivered') order.deliveredAt = new Date();
    order.trackingHistory.push({ status: req.body.status, description: req.body.description || `Order ${req.body.status}` });
    await order.save();
    email.sendStatusUpdate(order, order.customer);
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/cancel', protect, authorize('customer'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status)) return res.status(400).json({ success: false, message: 'Cannot cancel at this stage' });
    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.trackingHistory.push({ status: 'cancelled', description: 'Cancelled by customer' });
    for (const i of order.items) await Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } });
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
