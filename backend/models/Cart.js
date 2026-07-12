const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    vendor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    name:      String,
    thumbnail: String,
    price:     Number,
    quantity:  { type: Number, default: 1, min: 1 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
