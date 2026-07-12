const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  vendor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name:         { type: String, required: true, trim: true },
  slug:         { type: String, unique: true, sparse: true },
  description:  { type: String, required: true },
  shortDesc:    { type: String, default: '' },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  category:     { type: String, required: true },
  tags:         [String],
  thumbnail:    { type: String, default: '📦' },
  images:       [String],
  stock:        { type: Number, required: true, default: 0, min: 0 },
  badge:        { type: String, enum: ['sale', 'new', 'hot', ''], default: '' },
  isFeatured:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  ratings: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
}, { timestamps: true });

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
