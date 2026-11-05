# ✦ AURA — Modern Full-Stack E-Commerce Platform (SQL Edition)

A production-ready, fully responsive, full-stack **E-Commerce Web Application** engineered with **React.js, Node.js, Express.js, and an SQL Relational Database (Sequelize ORM supporting SQLite, MySQL, and PostgreSQL)**, JWT authentication, dual payment integrations (Stripe & Razorpay), and an **Admin Management Dashboard**. Designed with a professional dark theme featuring glassmorphism elements, live search, multi-factor filtering, real-time cart synchronization, and complete order tracking.

---

## 🛠️ Technology Stack & SQL Architecture

| Component | Technology |
|---|---|
| **Frontend Framework** | React 18+ with Vite (Fast HMR & Optimized Build) |
| **Styling & Effects** | Tailwind CSS 3.4, Custom Glassmorphism, CSS Backdrop Filters |
| **Icons** | Lucide React |
| **Celebrations** | Canvas Confetti |
| **Backend Runtime** | Node.js (v18+) & Express.js |
| **SQL Database ORM** | **Sequelize ORM** |
| **Supported SQL Engines**| **SQLite** (Default, zero-setup), **MySQL**, **PostgreSQL** |
| **Security & Auth** | JSON Web Tokens (JWT), BcryptJS, CORS, Morgan |
| **Payments** | Stripe & Razorpay compatible payment intent handlers |

---

## 🗄️ SQL Database Tables & Structure

All models are mapped into real relational SQL tables with foreign key constraints, automated timestamps, and cascading relations:

1. **`users`** — `id`, `name`, `email` (unique), `password` (bcrypt hash), `role` (`user`/`admin`), `phone`, `avatar`, `addresses` (JSON array of delivery addresses).
2. **`categories`** — `id`, `name`, `slug` (unique), `description`, `image`, `icon`, `isFeatured`.
3. **`products`** — `id`, `name`, `slug`, `description`, `shortDescription`, `price`, `originalPrice`, `discountPercent`, `category`, `brand`, `images` (JSON array of URLs), `stock`, `rating`, `numReviews`, `isFeatured`, `isNewArrival`, `specifications` (JSON array), `features` (JSON array).
4. **`carts` & `cart_items`** — Relational shopping cart storing line items with quantities and product references.
5. **`orders` & `order_items`** — Real-time orders storing order numbers (`AUR-XXXXXX-XXXX`), user relation, status history (`statusTimeline`), line totals, shipping addresses, and payment references.
6. **`reviews`** — Customer product reviews with star ratings (1–5) and verified purchase badges.
7. **`payments`** — Transaction records with gateway identification and transaction IDs.

---

## 🔌 How to Connect Your SQL Database

The database configuration is controlled via [`backend/.env`](file:///e:/E-COM/backend/.env) and handled in [`backend/config/db.js`](file:///e:/E-COM/backend/config/db.js).

### Option 1: SQLite (Default — Ready Immediately, Zero Setup Required)
SQLite creates a local SQL database file directly inside your repository at [`backend/data/database.sqlite`](file:///e:/E-COM/backend/data). You do **not** need to install any external database server:

```env
# backend/.env
DB_DIALECT=sqlite
```

---

### Option 2: MySQL (e.g. XAMPP, phpMyAdmin, Local MySQL, or Remote MySQL)
1. Ensure your MySQL server is running (e.g. start MySQL in XAMPP or via Windows Services).
2. Create an empty database in MySQL:
   ```sql
   CREATE DATABASE aura_ecom;
   ```
3. Update [`backend/.env`](file:///e:/E-COM/backend/.env):
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=aura_ecom
   DB_USER=root
   DB_PASS=
   ```
4. Start the backend. Sequelize will automatically create all tables and seed the database:
   ```powershell
   cd backend
   npm run seed
   ```

---

### Option 3: PostgreSQL (e.g. pgAdmin, Local Postgres, Supabase, Neon)
1. Ensure your PostgreSQL server is active.
2. Create an empty database:
   ```sql
   CREATE DATABASE aura_ecom;
   ```
3. Update [`backend/.env`](file:///e:/E-COM/backend/.env):
   ```env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aura_ecom
   DB_USER=postgres
   DB_PASS=your_postgres_password
   ```

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Store Administrator** | `admin@store.com` | `admin123` | Full Admin Dashboard (`/admin`) & Store |
| **Customer** | `customer@store.com` | `customer123` | Storefront, Cart, Checkout, Orders |

*(On the `/login` screen, click the **"Admin"** or **"Customer"** quick-fill button to auto-fill credentials instantly).*

### 🎟️ Promo Codes:
- `SAVE10` — 10% discount on order subtotal.
- `AURA20` — 20% VIP flash sale discount on order subtotal.

---

## 🚀 Quick Start Guide

### Start Both Servers Concurrently:
From the root directory (`e:\E-COM`):

```powershell
node start.js
```
*(or `npm start`)*

This starts:
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:3000`

---

## 🧪 Automated End-to-End Test Suite

Run the automated verification suite to test all 10 SQL workflows:

```powershell
cd backend
npm test
```

---

## 🛡️ License
Released under the **MIT License**.
