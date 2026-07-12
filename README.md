
- Shopping cart
- Product details page
- Order processing with tracking
- Vendor & Customer & Admin roles
- Product listing by vendors
- Cart, checkout, order tracking
- Admin dashboard (products, users, orders, vendors)
- Customer reviews & ratings
- Email notifications (Nodemailer)
- Responsive mobile-first design
- MongoDB + Node.js + Express backend

---

## 🚀 HOW TO RUN (3 Commands Only)

### Step 1 — Open CMD in backend folder
```
cd backend
```

### Step 2 — Install packages
```
npm install
```

### Step 3 — Seed database
```
npm run seed
```

### Step 4 — Start server
```
npm run dev
```

### Step 5 — Open frontend
Open `frontend/index.html` in browser
(Right click → Open with Live Server in VS Code)

---

## 🔑 LOGIN ACCOUNTS

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@marketnest.com     | admin123    |
| Vendor 1 | ali@techzone.com         | vendor123   |
| Vendor 2 | sara@fashionhub.com      | vendor123   |
| Customer | customer@test.com        | customer123 |

---

## 📧 EMAIL SETUP (Optional)
Open `backend/.env` and add your Gmail:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_digit_app_password
```
Gmail App Password guide: https://support.google.com/accounts/answer/185833

---

## 📁 FOLDER STRUCTURE
```
marketnest_complete/
├── backend/
│   ├── .env              ← MongoDB Atlas already configured!
│   ├── server.js
│   ├── models/           ← Database schemas
│   ├── routes/           ← API endpoints
│   ├── middleware/        ← JWT auth
│   └── utils/            ← Email + seeder
└── frontend/
    └── index.html        ← Complete UI (all pages)
```



## credentials
Admin: admin@marketnest.com / admin123

Vendor 1: ali@techzone.com / vendor123

Vendor 2: sara@fashionhub.com / vendor123

Vendor 3: home@homedecor.com / vendor123

Customer: customer@test.com / customer123
