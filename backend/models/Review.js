const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    { type: String, maxlength: 100, default: '' },
  body:     { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

ReviewSchema.index({ product: 1, customer: 1 }, { unique: true });

ReviewSchema.post('save', async function () {
  const Product = require('./Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(this.product, {
    'ratings.average': stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
    'ratings.count':   stats.length ? stats[0].count : 0,
  });
});

module.exports = mongoose.model('Review', ReviewSchema);
