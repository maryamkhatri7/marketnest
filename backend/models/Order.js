const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    vendor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    name:      String,
    thumbnail: String,
    price:     Number,
    quantity:  { type: Number, min: 1 },
  }],
  shippingAddress: {
    fullName: String, street: String, city: String,
    state: String, zip: String, country: String, phone: String,
  },
  payment: {
    method: { type: String, enum: ['cod', 'stripe', 'paypal'], default: 'cod' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
  },
  pricing: {
    subtotal: Number, shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 }, total: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed',
  },
  trackingNumber: String,
  trackingHistory: [{
    status: String, description: String, timestamp: { type: Date, default: Date.now },
  }],
  cancelReason: String,
  deliveredAt:  Date,
}, { timestamps: true });

OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `MN-${String(count + 1001).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
