const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName:   { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, default: '' },
  logo:        { type: String, default: '🏪' },
  category:    { type: String, default: '' },
  contact:     { email: String, phone: String },
  address:     { city: String, country: { type: String, default: 'Pakistan' } },
  ratings:     { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  totalSales:   { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
}, { timestamps: true });

VendorSchema.pre('save', function (next) {
  if (this.isModified('storeName')) {
    this.slug = this.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Vendor', VendorSchema);
