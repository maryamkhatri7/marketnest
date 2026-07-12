// routes/auth.js
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const User    = require('../models/User');
const Vendor  = require('../models/Vendor');
const { protect } = require('../middleware/auth');
const email   = require('../utils/email');

const sendToken = (user, status, res) => {
  const token = user.getSignedJwt();
  res.status(status).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email: em, password, role, storeName } = req.body;
    if (await User.findOne({ email: em })) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email: em, password, role: role || 'customer' });
    if (role === 'vendor') {
      if (!storeName) { await User.findByIdAndDelete(user._id); return res.status(400).json({ success: false, message: 'Store name required for vendor' }); }
      const vendor = await Vendor.create({ owner: user._id, storeName, status: 'pending' });
      await User.findByIdAndUpdate(user._id, { vendorProfile: vendor._id });
    }
    email.sendWelcome(user);
    sendToken(user, 201, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email: em, password } = req.body;
    if (!em || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email: em }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('vendorProfile');
  res.json({ success: true, user });
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) return res.status(400).json({ success: false, message: 'Current password wrong' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const raw = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    email.sendPasswordReset(user, `${process.env.CLIENT_URL}/reset-password.html?token=${raw}`);
    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
