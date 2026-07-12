const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/vendors',  require('./routes/vendors'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/users',    require('./routes/users'));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB Atlas connected successfully!');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
      console.log(`📦  API ready at http://localhost:${PORT}/api`);
      console.log(`\n👉  Now open frontend/index.html in browser`);
    });
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
