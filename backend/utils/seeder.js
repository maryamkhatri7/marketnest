require('dotenv').config();
const mongoose = require('mongoose');
const User    = require('../models/User');
const Vendor  = require('../models/Vendor');
const Product = require('../models/Product');

async function seed() {
  console.log('🔄  Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected!');

  // Drop indexes to avoid slug conflicts
  await mongoose.connection.db.collection('products').dropIndexes().catch(()=>{});
  await User.deleteMany({});
  await Vendor.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑   Cleared old data');

  // ── USERS ──
  const admin = await User.create({ name: 'Admin User', email: 'admin@marketnest.com', password: 'admin123', role: 'admin' });
  const v1u = await User.create({ name: 'Ali Khan',    email: 'ali@techzone.com',    password: 'vendor123', role: 'vendor' });
  const v2u = await User.create({ name: 'Sara Ahmed',  email: 'sara@fashionhub.com', password: 'vendor123', role: 'vendor' });
  const v3u = await User.create({ name: 'Home Pro',    email: 'home@homedecor.com',  password: 'vendor123', role: 'vendor' });
  const v4u = await User.create({ name: 'Sports Guy',  email: 'sports@master.com',   password: 'vendor123', role: 'vendor' });
  const v5u = await User.create({ name: 'Glow Beauty', email: 'glow@beauty.com',     password: 'vendor123', role: 'vendor' });
  await User.create({ name: 'Test Customer', email: 'customer@test.com', password: 'customer123', role: 'customer' });

  // ── VENDORS ──
  const v1 = await Vendor.create({ owner: v1u._id, storeName: 'TechZone PK',   slug: 'techzone-pk',   category: 'Electronics', status: 'approved', totalSales: 1200, totalRevenue: 850000 });
  const v2 = await Vendor.create({ owner: v2u._id, storeName: 'FashionHub',    slug: 'fashionhub',    category: 'Fashion',     status: 'approved', totalSales: 680,  totalRevenue: 340000 });
  const v3 = await Vendor.create({ owner: v3u._id, storeName: 'HomeDecor Pro', slug: 'homedecor-pro', category: 'Home',        status: 'approved', totalSales: 420,  totalRevenue: 210000 });
  const v4 = await Vendor.create({ owner: v4u._id, storeName: 'SportsMaster',  slug: 'sportsmaster',  category: 'Sports',      status: 'approved', totalSales: 310,  totalRevenue: 180000 });
  const v5 = await Vendor.create({ owner: v5u._id, storeName: 'GlowUp PK',     slug: 'glowup-pk',     category: 'Beauty',      status: 'approved', totalSales: 520,  totalRevenue: 290000 });

  await User.findByIdAndUpdate(v1u._id, { vendorProfile: v1._id });
  await User.findByIdAndUpdate(v2u._id, { vendorProfile: v2._id });
  await User.findByIdAndUpdate(v3u._id, { vendorProfile: v3._id });
  await User.findByIdAndUpdate(v4u._id, { vendorProfile: v4._id });
  await User.findByIdAndUpdate(v5u._id, { vendorProfile: v5._id });

  // ── PRODUCTS (50) — all pending so admin must approve ──
  const products = [
    // TechZone PK — Electronics
    { vendor: v1._id, name: 'Wireless Pro Earbuds X5',       price: 4500,  comparePrice: 6000,  category: 'Electronics', thumbnail: 'images/e1.jpg',               stock: 45,  badge: 'hot',  ratings: { average: 4.8, count: 214 }, description: 'Premium ANC earbuds. 30hr battery, IPX4 waterproof, Bluetooth 5.0.' },
    { vendor: v1._id, name: 'Mechanical Keyboard RGB TKL',   price: 7800,  comparePrice: 9500,  category: 'Electronics', thumbnail: 'images/k1.jpg',               stock: 22,  badge: 'hot',  ratings: { average: 4.9, count: 312 }, description: 'TKL keyboard Cherry MX switches, per-key RGB, aluminum frame.' },
    { vendor: v1._id, name: '4K Action Camera Pro',          price: 12500, comparePrice: 16000, category: 'Electronics', thumbnail: 'images/camera.jpg',           stock: 15,  badge: 'sale', ratings: { average: 4.7, count: 188 }, description: '4K 60fps, waterproof 30m, electronic stabilization, 2 batteries.' },
    { vendor: v1._id, name: 'Smart Watch Pro X',             price: 8500,  comparePrice: 12000, category: 'Electronics', thumbnail: 'images/smartwatch.jpg',       stock: 35,  badge: 'hot',  ratings: { average: 4.7, count: 189 }, description: 'AMOLED display, heart rate, SpO2, sleep tracking, 7-day battery.' },
    { vendor: v1._id, name: 'Noise Cancelling Headphones',   price: 6200,  comparePrice: 8500,  category: 'Electronics', thumbnail: 'images/headphones.jpg',       stock: 28,  badge: 'sale', ratings: { average: 4.8, count: 267 }, description: '40dB ANC, 35hr battery, USB-C quick charge, premium 40mm drivers.' },
    { vendor: v1._id, name: 'Portable Power Bank 20000mAh',  price: 3800,  comparePrice: 5000,  category: 'Electronics', thumbnail: 'images/powerbank.jpg',        stock: 80,  badge: 'sale', ratings: { average: 4.6, count: 312 }, description: '65W USB-C PD output, charges laptops + phones, LED display.' },
    { vendor: v1._id, name: 'Wireless Charging Pad 15W',     price: 1600,  comparePrice: 2200,  category: 'Electronics', thumbnail: 'images/chargingpad.jpg',      stock: 90,  badge: 'sale', ratings: { average: 4.5, count: 198 }, description: '15W fast wireless charging, Qi compatible, anti-slip surface.' },
    { vendor: v1._id, name: 'Bluetooth Speaker Waterproof',  price: 4200,  comparePrice: 5800,  category: 'Electronics', thumbnail: 'images/bluetoothspeaker.jpg', stock: 32,  badge: 'hot',  ratings: { average: 4.7, count: 289 }, description: 'IPX7 waterproof, 24hr battery, 360 surround sound, floats on water.' },
    { vendor: v1._id, name: 'USB-C Hub 7-in-1 Aluminum',    price: 3200,  comparePrice: 4500,  category: 'Electronics', thumbnail: 'images/usb.jpg',              stock: 55,  badge: 'sale', ratings: { average: 4.6, count: 167 }, description: '4K HDMI, 100W PD charging, SD reader, plug-and-play.' },

    // Gaming
    { vendor: v1._id, name: 'Gaming Chair Ergonomic Pro',    price: 18000, comparePrice: 24000, category: 'Gaming',      thumbnail: 'images/chair.jpg',            stock: 12,  badge: 'sale', ratings: { average: 4.6, count: 94  }, description: 'Lumbar support, 180 recline, 4D adjustable armrests, breathable mesh.' },
    { vendor: v1._id, name: 'LED Gaming Monitor 27"',        price: 42000, comparePrice: 55000, category: 'Gaming',      thumbnail: 'images/pc.jpg',               stock: 12,  badge: 'hot',  ratings: { average: 4.9, count: 94  }, description: '165Hz, 1ms, QHD resolution, G-Sync compatible, HDR400.' },
    { vendor: v1._id, name: 'Gaming Mouse Wireless RGB',     price: 5500,  comparePrice: 7500,  category: 'Gaming',      thumbnail: 'images/mouse.jpg',            stock: 28,  badge: 'hot',  ratings: { average: 4.8, count: 234 }, description: '25600 DPI, 70hr battery, Bluetooth dual mode, per-key RGB.' },
    { vendor: v1._id, name: 'Gaming Headset 7.1 Surround',   price: 4800,  comparePrice: 6500,  category: 'Gaming',      thumbnail: 'images/headphoness.jpg',      stock: 20,  badge: 'sale', ratings: { average: 4.7, count: 198 }, description: '7.1 virtual surround, noise-cancelling mic, RGB lighting.' },
    { vendor: v1._id, name: 'Controller Charging Dock PS5',  price: 2800,  comparePrice: 3800,  category: 'Gaming',      thumbnail: 'images/dualcontrollerchargingdock.jpg', stock: 35, badge: 'new', ratings: { average: 4.6, count: 145 }, description: 'Dual PS5 controller dock, 2.5hr charge, LED indicators.' },

    // FashionHub
    { vendor: v2._id, name: 'Urban Fit Sneakers',            price: 3200,  comparePrice: 4500,  category: 'Fashion',     thumbnail: 'images/s1.jpg',               stock: 80,  badge: 'sale', ratings: { average: 4.5, count: 87  }, description: 'Lightweight mesh sneakers with premium memory foam insole.' },
    { vendor: v2._id, name: 'Linen Summer Dress',            price: 2400,  comparePrice: 0,     category: 'Fashion',     thumbnail: 'images/d1.jpg',               stock: 60,  badge: 'new',  ratings: { average: 4.4, count: 62  }, description: '100% stonewashed premium linen, 6 colors, machine washable.' },
    { vendor: v2._id, name: 'Premium Leather Handbag',       price: 5500,  comparePrice: 7000,  category: 'Fashion',     thumbnail: 'images/bag.jpg',              stock: 30,  badge: 'sale', ratings: { average: 4.6, count: 55  }, description: 'Genuine full-grain leather, gold hardware, multiple compartments.' },
    { vendor: v2._id, name: 'Mens Casual Linen Shirt',       price: 1800,  comparePrice: 2500,  category: 'Fashion',     thumbnail: 'images/shirt.jpg',            stock: 90,  badge: 'new',  ratings: { average: 4.4, count: 156 }, description: '100% premium linen, breathable, S to XXL, 4 colors.' },
    { vendor: v2._id, name: 'Leather Wallet Slim',           price: 2200,  comparePrice: 3000,  category: 'Fashion',     thumbnail: 'images/wallet.jpg',           stock: 65,  badge: 'new',  ratings: { average: 4.5, count: 88  }, description: 'RFID blocking, 8 card slots, genuine leather, gift box.' },
    { vendor: v2._id, name: 'Perfume Oud Collection',        price: 4500,  comparePrice: 6000,  category: 'Beauty',      thumbnail: 'images/perfume.jpg',          stock: 45,  badge: 'hot',  ratings: { average: 4.7, count: 203 }, description: '100ml, 12hr projection, natural oud wood and Bulgarian rose.' },

    // HomeDecor Pro
    { vendor: v3._id, name: 'Smart LED Desk Lamp',           price: 1800,  comparePrice: 0,     category: 'Home & Garden', thumbnail: 'images/l.jpg',             stock: 100, badge: 'new',  ratings: { average: 4.7, count: 156 }, description: '3000K-6500K adjustable, USB-C charging port, touch dimmer.' },
    { vendor: v3._id, name: 'Bamboo Cutting Board Set',      price: 1200,  comparePrice: 1600,  category: 'Home & Garden', thumbnail: 'images/c1.webp',           stock: 75,  badge: 'sale', ratings: { average: 4.3, count: 29  }, description: 'Set of 3 eco-friendly antibacterial bamboo boards S/M/L.' },
    { vendor: v3._id, name: 'Portable Blender 600ml',        price: 2200,  comparePrice: 2900,  category: 'Home & Garden', thumbnail: 'images/blender.jpg',       stock: 65,  badge: '',     ratings: { average: 4.2, count: 38  }, description: 'USB-C rechargeable, 6 stainless blades, BPA-free 600ml bottle.' },
    { vendor: v3._id, name: 'Non-Stick Cookware Set 5pc',    price: 6800,  comparePrice: 9500,  category: 'Home & Garden', thumbnail: 'images/nonstick.jpg',      stock: 30,  badge: 'sale', ratings: { average: 4.6, count: 134 }, description: 'Granite-coated, PFOA-free, dishwasher safe, induction compatible.' },
    { vendor: v3._id, name: 'Air Fryer 5.5L Digital',        price: 9500,  comparePrice: 13000, category: 'Home & Garden', thumbnail: 'images/airfryer.jpg',      stock: 22,  badge: 'hot',  ratings: { average: 4.8, count: 278 }, description: '12 preset functions, 1700W, touch display, dishwasher-safe basket.' },

    // SportsMaster
    { vendor: v4._id, name: 'Pro Yoga Mat & Band Set',       price: 2100,  comparePrice: 2800,  category: 'Sports',      thumbnail: 'images/m1.jpg',               stock: 50,  badge: '',     ratings: { average: 4.6, count: 43  }, description: '6mm non-slip mat + 3 resistance bands light/medium/heavy.' },
    { vendor: v4._id, name: 'Football Official Match Ball',  price: 2800,  comparePrice: 3800,  category: 'Sports',      thumbnail: 'images/football.jpg',         stock: 55,  badge: 'sale', ratings: { average: 4.5, count: 89  }, description: 'FIFA approved size 5, hand-stitched PU leather, 32-panel.' },
    { vendor: v4._id, name: 'Dumbbell Set Adjustable 20kg',  price: 7500,  comparePrice: 10000, category: 'Sports',      thumbnail: 'images/dumbbells.jpg',        stock: 18,  badge: 'sale', ratings: { average: 4.7, count: 167 }, description: 'Quick-change dial system, rubber-coated plates, 2-20kg per dumbbell.' },

    // Books
    { vendor: v3._id, name: 'JavaScript Mastery Book',       price: 850,   comparePrice: 1200,  category: 'Books',       thumbnail: 'images/b1.jpg',               stock: 200, badge: 'hot',  ratings: { average: 5.0, count: 505 }, description: 'ES6+, async/await, React basics, 50 real-world projects.' },
    { vendor: v3._id, name: 'Python Programming Book',       price: 950,   comparePrice: 1400,  category: 'Books',       thumbnail: 'images/pb.jpg',               stock: 180, badge: 'hot',  ratings: { average: 4.9, count: 445 }, description: 'Beginner to advanced, Django, data science, 50 projects, Python 3.12.' },

    // GlowUp PK — Beauty
    { vendor: v5._id, name: 'Vitamin C Brightening Serum',   price: 2800,  comparePrice: 3800,  category: 'Beauty',      thumbnail: 'images/vitc.jpg',             stock: 60,  badge: 'hot',  ratings: { average: 4.8, count: 334 }, description: '20% Vitamin C + Hyaluronic Acid, reduces dark spots, 30ml.' },
    { vendor: v5._id, name: 'Matte Lipstick Set 12 Shades',  price: 1800,  comparePrice: 2500,  category: 'Beauty',      thumbnail: 'images/lipstick.jpg',         stock: 85,  badge: 'sale', ratings: { average: 4.6, count: 218 }, description: '12-piece long-lasting matte, Vitamin E formula, 8hr wear.' },
    { vendor: v5._id, name: 'Hydrating Face Moisturizer SPF50', price: 3200, comparePrice: 4200, category: 'Beauty',     thumbnail: 'images/moisturizer.jpg',      stock: 50,  badge: 'new',  ratings: { average: 4.7, count: 189 }, description: 'Non-greasy SPF50, niacinamide, ceramides, hyaluronic acid, 50ml.' },
    { vendor: v5._id, name: 'Rose Water Facial Mist 200ml',  price: 950,   comparePrice: 1400,  category: 'Beauty',      thumbnail: 'images/rosemist.jpg',         stock: 120, badge: 'new',  ratings: { average: 4.5, count: 156 }, description: '100% pure Bulgarian rose water, no alcohol, use over makeup.' },
    { vendor: v5._id, name: 'Complete Makeup Brush Set 24pc',price: 2400,  comparePrice: 3500,  category: 'Beauty',      thumbnail: 'images/makeupbrushes.jpg',    stock: 40,  badge: 'sale', ratings: { average: 4.6, count: 143 }, description: 'Vegan bristles, rose gold handles, leather roll pouch included.' },

    // Automotive (TechZone)
    { vendor: v1._id, name: 'Car Dash Cam 4K Dual Lens',     price: 7500,  comparePrice: 10000, category: 'Automotive',  thumbnail: 'images/duallenscamera.jpg',   stock: 25,  badge: 'hot',  ratings: { average: 4.7, count: 167 }, description: '4K front + 1080P rear, GPS, G-sensor, 3-inch IPS display.' },
    { vendor: v1._id, name: 'Car Phone Mount Magnetic Pro',  price: 1200,  comparePrice: 1800,  category: 'Automotive',  thumbnail: 'images/magneticphonemount.jpg', stock: 150, badge: 'sale', ratings: { average: 4.5, count: 289 }, description: 'Strong magnetic, 360 rotation, military-grade suction cup.' },
    { vendor: v1._id, name: 'Tyre Inflator Cordless 12V',    price: 4500,  comparePrice: 6000,  category: 'Automotive',  thumbnail: 'images/tyreinflator.jpg',     stock: 35,  badge: 'sale', ratings: { average: 4.6, count: 134 }, description: '150 PSI, auto-shutoff at preset pressure, LED torch, carry bag.' },
    { vendor: v1._id, name: 'Car Seat Cover Set Premium',    price: 5500,  comparePrice: 7500,  category: 'Automotive',  thumbnail: 'images/carseat.jpg',          stock: 30,  badge: 'new',  ratings: { average: 4.4, count: 98  }, description: 'PU leather, universal fit, waterproof, airbag compatible.' },
    { vendor: v1._id, name: 'Car Air Freshener Oud Wood',    price: 850,   comparePrice: 1200,  category: 'Automotive',  thumbnail: 'images/airfreshner.jpg',      stock: 200, badge: 'hot',  ratings: { average: 4.7, count: 312 }, description: '60-day lasting fragrance, 4 scents, pack of 3.' },

    // Pets (HomeDecor)
    { vendor: v3._id, name: 'Premium Dog Food Chicken 5kg',  price: 3200,  comparePrice: 4200,  category: 'Pets',        thumbnail: 'images/dogfood.jpg',          stock: 45,  badge: 'hot',  ratings: { average: 4.8, count: 223 }, description: 'Grain-free, real chicken #1 ingredient, Omega-3 & 6 for healthy coat.' },
    { vendor: v3._id, name: 'Cat Tree Tower Deluxe 140cm',   price: 5800,  comparePrice: 7500,  category: 'Pets',        thumbnail: 'images/cattreetower.jpg',     stock: 15,  badge: 'sale', ratings: { average: 4.7, count: 178 }, description: 'Hammock, perch, scratching posts, hanging toys, supports 15kg.' },
    { vendor: v3._id, name: 'Pet Grooming Kit 7-in-1',       price: 2800,  comparePrice: 3800,  category: 'Pets',        thumbnail: 'images/petgrooming.jpg',      stock: 50,  badge: 'new',  ratings: { average: 4.6, count: 145 }, description: 'Quiet motor under 50dB, USB rechargeable, for dogs and cats.' },
    { vendor: v3._id, name: 'Automatic Pet Water Fountain',  price: 2200,  comparePrice: 3000,  category: 'Pets',        thumbnail: 'images/petwaterfountain.jpg', stock: 40,  badge: 'new',  ratings: { average: 4.7, count: 167 }, description: '2.5L, triple filtration, ultra-quiet pump, BPA-free material.' },
    { vendor: v3._id, name: 'Interactive Pet Toy Set',       price: 1400,  comparePrice: 1900,  category: 'Pets',        thumbnail: 'images/pettoys.jpg',          stock: 80,  badge: 'sale', ratings: { average: 4.5, count: 112 }, description: '6 toys: feather wand, laser pointer, tunnel, catnip mouse.' },

    // Food (HomeDecor)
    { vendor: v3._id, name: 'Premium Desi Ghee 1kg Pure',    price: 2800,  comparePrice: 3500,  category: 'Food',        thumbnail: 'images/desighee.jpg',         stock: 60,  badge: 'hot',  ratings: { average: 4.9, count: 445 }, description: '100% pure A2 desi cow ghee, bilona method, lab tested, glass jar.' },
    { vendor: v3._id, name: 'Organic Honey Sidr 500g',       price: 3500,  comparePrice: 4800,  category: 'Food',        thumbnail: 'images/honey.jpg',            stock: 35,  badge: 'hot',  ratings: { average: 4.8, count: 312 }, description: 'Wild Sidr honey, cold extracted, raw unfiltered, certificate included.' },
    { vendor: v3._id, name: 'Dry Fruit Gift Box Premium',    price: 2200,  comparePrice: 3000,  category: 'Food',        thumbnail: 'images/dryfruits.jpg',        stock: 50,  badge: 'sale', ratings: { average: 4.7, count: 234 }, description: 'Almonds, cashews, pistachios, walnuts, dates. 800g wooden box.' },
    { vendor: v3._id, name: 'Green Tea Organic 100 Bags',    price: 1200,  comparePrice: 1600,  category: 'Food',        thumbnail: 'images/greentea.jpg',         stock: 100, badge: 'new',  ratings: { average: 4.6, count: 189 }, description: 'Kaghan valley estates, original/mint/lemon/ginger variants.' },
    { vendor: v3._id, name: 'Mixed Spice Box Desi Masala',   price: 1800,  comparePrice: 2400,  category: 'Food',        thumbnail: 'images/spice.jpg',            stock: 75,  badge: 'new',  ratings: { average: 4.8, count: 267 }, description: '12 hand-blended masalas, stone-ground, no artificial colors.' },
  ];

  // Insert all 50 products with approvalStatus: 'pending'
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await Product.create({
      ...p,
      approvalStatus: 'pending',
      isActive: true,
      isFeatured: ['hot'].includes(p.badge),
    });
  }

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  ✅  Database Seeded Successfully!                    ║`);
  console.log(`╠══════════════════════════════════════════════════════╣`);
  console.log(`║  50 products added — ALL PENDING admin approval       ║`);
  console.log(`║                                                        ║`);
  console.log(`║  Login Credentials:                                    ║`);
  console.log(`║  Admin:    admin@marketnest.com  / admin123            ║`);
  console.log(`║  Vendor 1: ali@techzone.com      / vendor123           ║`);
  console.log(`║  Vendor 2: sara@fashionhub.com   / vendor123           ║`);
  console.log(`║  Vendor 3: home@homedecor.com    / vendor123           ║`);
  console.log(`║  Vendor 4: sports@master.com     / vendor123           ║`);
  console.log(`║  Vendor 5: glow@beauty.com       / vendor123           ║`);
  console.log(`║  Customer: customer@test.com     / customer123         ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seeder error:', err.message); process.exit(1); });
