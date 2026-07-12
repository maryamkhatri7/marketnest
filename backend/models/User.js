const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  avatar:   { type: String, default: '' },
  phone:    { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{
    label:    String,
    street:   String,
    city:     String,
    state:    String,
    zip:      String,
    country:  { type: String, default: 'Pakistan' },
    isDefault: { type: Boolean, default: false },
  }],
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = mongoose.model('User', UserSchema);
