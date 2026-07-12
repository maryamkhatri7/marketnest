const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const base = (body) => `<!DOCTYPE html><html><head><style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden}
  .hdr{background:linear-gradient(135deg,#f0a500,#ff6b35);padding:24px 32px}
  .hdr h1{margin:0;color:#000;font-size:22px}
  .bdy{padding:28px 32px;color:#333;line-height:1.6}
  .btn{display:inline-block;background:#f0a500;color:#000;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;margin:16px 0}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th{background:#f9f9f9;padding:9px;text-align:left;font-size:12px;color:#666;border:1px solid #eee}
  td{padding:9px;border:1px solid #eee;font-size:13px}
  .ftr{background:#f9f9f9;padding:14px 32px;font-size:12px;color:#999;text-align:center}
</style></head><body><div class="wrap">
  <div class="hdr"><h1>🛒 MarketNest</h1></div>
  <div class="bdy">${body}</div>
  <div class="ftr">© 2025 MarketNest · Apexcify Technologys Internship</div>
</div></body></html>`;

const send = (opts) => transporter.sendMail({ from: `MarketNest <${process.env.EMAIL_USER}>`, ...opts }).catch(e => console.log('Email skipped:', e.message));

exports.sendWelcome = (user) => send({
  to: user.email, subject: '🎉 Welcome to MarketNest!',
  html: base(`<h2>Hi ${user.name}, welcome! 👋</h2><p>Your <strong>${user.role}</strong> account is ready.</p><a class="btn" href="${process.env.CLIENT_URL}">Start Shopping →</a>`),
});

exports.sendOrderConfirm = (order, user) => send({
  to: user.email, subject: `✅ Order Confirmed — #${order.orderNumber}`,
  html: base(`<h2>Order Confirmed! 🎉</h2><p>Hi <strong>${user.name}</strong>, your order is confirmed.</p>
  <table><tr><th>Order #</th><td>${order.orderNumber}</td></tr><tr><th>Total</th><td>PKR ${order.pricing.total.toLocaleString()}</td></tr><tr><th>Payment</th><td>${order.payment.method.toUpperCase()}</td></tr><tr><th>Ship to</th><td>${order.shippingAddress.city}, ${order.shippingAddress.country}</td></tr></table>
  <h3>Items:</h3><table><tr><th>Product</th><th>Qty</th><th>Price</th></tr>${order.items.map(i=>`<tr><td>${i.name}</td><td>${i.quantity}</td><td>PKR ${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}</table>
  <a class="btn" href="${process.env.CLIENT_URL}">Track Order →</a>`),
});

exports.sendStatusUpdate = (order, user) => send({
  to: user.email, subject: `📦 Order #${order.orderNumber} → ${order.status.toUpperCase()}`,
  html: base(`<h2>Order Status Updated</h2><p>Hi <strong>${user.name}</strong>, order <strong>#${order.orderNumber}</strong> is now:</p><p style="font-size:24px;font-weight:800;color:#f0a500;text-transform:uppercase">${order.status}</p><a class="btn" href="${process.env.CLIENT_URL}">View Order →</a>`),
});

exports.sendVendorApproved = (vendor, owner) => send({
  to: owner.email, subject: '🏪 Your Store is Approved!',
  html: base(`<h2>Congratulations ${owner.name}! 🎉</h2><p>Your store <strong>${vendor.storeName}</strong> is now live on MarketNest!</p><a class="btn" href="${process.env.CLIENT_URL}">Go to Dashboard →</a>`),
});

exports.sendPasswordReset = (user, url) => send({
  to: user.email, subject: '🔑 Reset Your Password',
  html: base(`<h2>Password Reset</h2><p>Hi <strong>${user.name}</strong>, click below to reset your password. Expires in 15 minutes.</p><a class="btn" href="${url}">Reset Password →</a>`),
});
