# ✦ AURA — Modern Full-Stack E-Commerce Platform

A production-ready, responsive, full-stack **E-Commerce Web Application** engineered with **React.js, Node.js, Express.js, MongoDB**, JWT authentication, dual payment integrations (Stripe & Razorpay), and a full-featured **Admin Management Dashboard**. Designed with a professional dark theme featuring glassmorphism elements, micro-interactions, live search, multi-factor filtering, real-time cart synchronization, and complete order tracking.

---

## 📸 Key Highlights & Features

### 1. 🎨 UI/UX Design & Aesthetic
- **Dark Theme with Glassmorphism:** Deep `#080b11` slate/navy backdrop with ambient gradient glows, frosted glass cards (`backdrop-blur-xl`), and glowing border highlights.
- **Glass-Effect Interactive Elements:** Buttons with hover glows, click ripples, and smooth transitions.
- **Micro-Animations & Visual Celebrations:** Confetti burst on checkout completion, live countdown timers for promotional flash sales, hover zoom on product cards, and toast notifications.
- **100% Responsive Layout:** Tailored design across mobile phones, tablets, and widescreen desktop monitors.

### 2. 🔐 Authentication & Profile Management
- User Registration & Login with **JWT** token generation.
- Passwords securely hashed with **bcryptjs** (10 salt rounds).
- User Profile management: update name, phone, and profile avatar.
- **Address Book Manager:** Add, edit, delete, and set default shipping addresses.
- **Password Reset Flow:** Forgot password token request and reset mechanism.
- **One-Click Demo Login:** Dedicated buttons to log in instantly as **Admin** or **Customer**.

### 3. 🛍️ Dynamic Product Catalog
- High-resolution product image gallery with thumbnail previews and zoom.
- **Live Debounced Search:** Instant autocomplete search dropdown and keyword filtering.
- **Multi-Facet Filtering:** Filter products by Category, Brand, Price Range Slider, and Customer Star Rating.
- **Dynamic Sorting:** Sort by Price (Low to High, High to Low), Customer Rating, Newest Arrivals, and Popularity.
- **Quick View Modal:** Eyeball icon on cards opens instant product overview modal without leaving the catalog.
- **Ratings & Reviews System:** Verified purchase badge, average rating calculation, and review submission with interactive star selector.

### 4. 🛒 Shopping Cart & Checkout
- Add products, increase/decrease quantities with inventory limits, and remove items.
- **Dual Persistence:** Syncs with MongoDB/database for authenticated users and persists locally for guests.
- **Free Shipping Progress Bar:** Dynamic threshold indicator ($150 target).
- **Working Promo Codes:** Instant calculation with `SAVE10` (10% off) and `AURA20` (20% off).
- **Financial Calculation:** Real-time Subtotal, Shipping, Tax (8%), Coupon Discount, and Final Payable Total.

### 5. 💳 Payment Integration & Order Processing
- **Supported Payment Gateways:**
  - **Stripe:** Card checkout simulation with pre-filled test cards and instant verification.
  - **Razorpay:** UPI, NetBanking, and Card integration flow.
  - **Cash on Delivery (COD):** Direct order placement without online payment.
- **Itemized Invoice & Receipt:** Generated upon payment with print-to-PDF support, courier tracking number, and breakdown.

### 6. 📦 Order Management & Live Tracking
- View full order history with status pills: `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`.
- **Interactive Tracking Timeline:** Step-by-step order journey progress bar.
- **Order Cancellation:** Customers can cancel eligible orders (`Pending` or `Confirmed`) with restock automation.

### 7. 🛡️ Comprehensive Admin Control Center (`/admin`)
- **Protected Route Middleware:** Role-based access control (`admin` role required).
- **Overview & Analytics:** Real-time Gross Revenue, Total Lifetime Orders, Active Products, and Registered Customers with a 6-month sales growth bar graph.
- **Product Inventory Management:** Search, add new products, edit pricing/stock/images, and delete items.
- **Order Management:** Filter orders by status, change status via dropdown (`Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`), and assign courier tracking numbers.
- **Category Management:** Create, edit, and delete store categories.
- **User Directory:** View registered customers and promote/demote user roles between Customer and Admin.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 18+ with Vite (Fast HMR & Optimized Build) |
| **Styling & Effects** | Tailwind CSS 3.4, Custom Glassmorphism, CSS Backdrop Filters |
| **Icons** | Lucide React |
| **Celebrations** | Canvas Confetti |
| **Backend Runtime** | Node.js (v18+) & Express.js |
| **Database** | MongoDB with Mongoose (Dual-mode with persistent JSON fallback) |
| **Security & Auth** | JSON Web Tokens (JWT), BcryptJS, CORS, Morgan |
| **Payments** | Stripe & Razorpay compatible payment intent handlers |

---

## 🔑 Pre-Configured Test Credentials

For effortless evaluation, the system is primed with sample accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| **Store Administrator** | `admin@store.com` | `admin123` | Full Admin Dashboard (`/admin`) & Store |
| **Customer** | `customer@store.com` | `customer123` | Storefront, Cart, Checkout, Orders |

> 💡 **Tip:** On the `/login` screen, you can also click the **"Admin"** or **"Customer"** quick-fill button to auto-fill credentials in one click!

### 🎟️ Promo Codes for Testing:
- `SAVE10` — 10% discount on order subtotal.
- `AURA20` — 20% VIP flash sale discount on order subtotal.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed on your system.
- *(Optional)* **MongoDB** running locally or a MongoDB Atlas URI. *(If MongoDB is not installed locally, the server automatically operates in hybrid persistent storage mode without requiring any setup!)*

### 2. Launching Both Servers in One Command
From the root directory (`e:\E-COM`), run:

```bash
# Starts both Express API (:5000) and Vite React (:3000)
node start.js
```

Or run via npm:
```bash
npm start
```

### 3. Launching Manually (Separate Terminals)

#### Terminal 1 — Backend:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Open your browser at **[http://localhost:3000](http://localhost:3000)** to browse the application.

---

## 🧪 Automated End-to-End API Test Suite

The project includes an automated end-to-end testing script verifying all 10 core workflows (Health, Products, Search, Auth, Cart, Checkout, Order Placement, Admin Analytics, Status Updates, and Product Reviews):

```bash
cd backend
npm test
```

---

## 📂 Project Structure

```
E-COM/
├── package.json              # Root scripts
├── start.js                  # Concurrently launches backend & frontend
├── README.md                 # Complete documentation
│
├── backend/
│   ├── .env                  # Port, JWT Secret, MongoDB URI, API keys
│   ├── .env.example          # Sample environment variables
│   ├── package.json          # Express, Mongoose, JWT, BcryptJS, Morgan
│   ├── server.js             # Express application & route mounts
│   ├── seeder.js             # Standalone database seeder
│   ├── test-api.js           # 10-step automated verification suite
│   ├── config/
│   │   └── db.js             # Mongoose connection with graceful fallback
│   ├── data/
│   │   ├── initialProducts.js# Curated catalog with Unsplash images & specs
│   │   └── db_store.json     # Persistent store
│   ├── middleware/
│   │   ├── authMiddleware.js # protect, adminOnly, optionalAuth
│   │   └── errorMiddleware.js# notFound, errorHandler
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt password hashing
│   │   ├── Product.js        # Product schema with specs, ratings, stock
│   │   ├── Category.js       # Category schema
│   │   ├── Cart.js           # Cart schema
│   │   ├── Order.js          # Order schema with timeline & payment result
│   │   ├── Review.js         # Review schema with verified purchase flag
│   │   └── Payment.js        # Payment transaction records
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth
│   │   ├── productRoutes.js  # /api/products
│   │   ├── categoryRoutes.js # /api/categories
│   │   ├── cartRoutes.js     # /api/cart
│   │   ├── orderRoutes.js    # /api/orders
│   │   ├── paymentRoutes.js  # /api/payments
│   │   └── adminRoutes.js    # /api/admin
│   └── services/
│       └── storage.js        # Dual-mode persistence layer
│
└── frontend/
    ├── package.json          # React, Vite, Tailwind CSS, Lucide
    ├── vite.config.js        # Vite config with backend proxy (/api -> :5000)
    ├── tailwind.config.js    # Custom dark colors, glassmorphism shadows
    ├── postcss.config.js
    ├── index.html            # Web fonts & page metadata
    └── src/
        ├── main.jsx          # Entry point
        ├── index.css         # Glassmorphism utilities & base styles
        ├── App.jsx           # App routes & provider nesting
        ├── context/
        │   ├── AuthContext.jsx     # User authentication, JWT, addresses
        │   ├── CartContext.jsx     # Cart items, promo codes, financial math
        │   ├── WishlistContext.jsx # Saved items persistence
        │   └── ToastContext.jsx    # Glass toast notifications
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx      # Navigation, live search, cart badge, menu
        │   │   ├── Footer.jsx      # Values banner, newsletter, trust marks
        │   │   └── RatingStars.jsx # Interactive & display star ratings
        │   └── products/
        │       ├── ProductCard.jsx   # Zoom, discount pill, cart & wishlist action
        │       └── QuickViewModal.jsx# Product preview modal
        └── pages/
            ├── HomePage.jsx          # Hero carousel, categories, flash deals
            ├── ProductsPage.jsx      # Catalog with search, multi-filters, sort
            ├── ProductDetailsPage.jsx# Image gallery, specs, reviews form
            ├── CartPage.jsx          # Cart items, free shipping bar, coupons
            ├── CheckoutPage.jsx      # Shipping, Stripe/Razorpay/COD, summary
            ├── OrderConfirmationPage.jsx # Confetti, invoice receipt, tracking
            ├── OrdersPage.jsx        # Past orders, status badges, cancel modal
            ├── ProfilePage.jsx       # Personal details, addresses, password
            ├── WishlistPage.jsx      # Saved items grid with move-to-cart
            ├── LoginPage.jsx         # Sign in with one-click demo credentials
            ├── RegisterPage.jsx      # Account creation
            ├── ForgotPasswordPage.jsx# Security token reset flow
            └── admin/
                ├── AdminLayout.jsx     # Admin-only sidebar & guard
                ├── AdminDashboard.jsx  # Sales trends, stats, recent orders
                ├── AdminProducts.jsx   # Add/Edit/Delete products & stock
                ├── AdminOrders.jsx     # Order fulfillment & tracking numbers
                ├── AdminCategories.jsx # Add/Edit/Delete categories
                └── AdminUsers.jsx      # User directory & role switcher
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve authenticated user profile `[Protected]`
- `PUT /api/auth/profile` — Update name and phone number `[Protected]`
- `POST /api/auth/addresses` — Add shipping address `[Protected]`
- `DELETE /api/auth/addresses/:id` — Remove saved address `[Protected]`
- `PUT /api/auth/change-password` — Change password `[Protected]`
- `POST /api/auth/forgot-password` — Request password reset security token
- `POST /api/auth/reset-password` — Reset password using token

### Products & Reviews (`/api/products`)
- `GET /api/products` — List products with search, category, brand, min/max price, rating, sort, and pagination
- `GET /api/products/featured` — Get featured drops
- `GET /api/products/brands` — List distinct brands
- `GET /api/products/:id` — Get single product details
- `GET /api/products/:id/reviews` — Get product reviews
- `POST /api/products/:id/reviews` — Add review with rating & comment `[Protected]`
- `POST /api/products` — Create new product `[Admin]`
- `PUT /api/products/:id` — Update product details or stock `[Admin]`
- `DELETE /api/products/:id` — Delete product `[Admin]`

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Get current user's cart `[Protected]`
- `POST /api/cart/add` — Add item to cart `[Protected]`
- `PUT /api/cart/update` — Update item quantity `[Protected]`
- `DELETE /api/cart/remove/:productId` — Remove single item `[Protected]`
- `DELETE /api/cart/clear` — Clear entire cart `[Protected]`
- `POST /api/cart/sync` — Merge guest cart with account cart `[Protected]`

### Orders (`/api/orders`)
- `POST /api/orders` — Place order `[Protected]`
- `GET /api/orders/my-orders` — Get logged-in user's orders `[Protected]`
- `GET /api/orders/:id` — Get single order details `[Protected]`
- `PUT /api/orders/:id/cancel` — Cancel eligible order `[Protected]`

### Payments (`/api/payments`)
- `POST /api/payments/create-intent` — Initialize Stripe or Razorpay intent `[Protected]`
- `POST /api/payments/verify` — Verify transaction & capture payment `[Protected]`

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` — Revenue, order counts, users, products, sales graph `[Admin]`
- `GET /api/admin/orders` — List all customer orders with filters `[Admin]`
- `PUT /api/admin/orders/:id/status` — Update order status & courier tracking `[Admin]`
- `GET /api/admin/users` — List all registered users `[Admin]`
- `PUT /api/admin/users/:id/role` — Promote/demote user role (User ↔ Admin) `[Admin]`

---

## 🛡️ License
Released under the **MIT License**. Engineered for modern web applications.
