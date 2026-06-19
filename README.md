# ShopEZ — Full-Stack MERN E-Commerce Platform

ShopEZ is a lightweight, responsive, and production-ready e-commerce web application built on the MERN stack (MongoDB, Express, React, Node.js). It features a custom design system built with vanilla CSS, a unified dark-themed administrative dashboard, stateless session management, live catalog query filtering, and a clean checkout pipeline.

---

## 🚀 Key Features

### 🛒 Customer Storefront
* **Aesthetic Landing Page:** Features a high-resolution hero banner (configurable by administrators) and quick-select category tiles.
* **Smart Catalog Filters:** Supports regex search matching (across titles and descriptions), checkbox filtering for categories and gender groups, and radio buttons to sort items by Price (low to high, high to low), Discount, and Popularity.
* **Interactive Product Details:** Includes a thumbnail carousel gallery (click to swap active views), size selector buttons (S, M, L, XL), quantity adjustments, and add-to-cart actions.
* **Cart Management:** Synchronizes shopping carts per user, allowing item quantity increment/decrement, item removal, and full cart clearances. The page dynamically displays an itemized invoice (MRP totals, active discounts, shipping fee savings, and grand checkout totals).
* **Order Placement & Tracking:** Shipping details entry forms with validation rules (e.g., 10-digit mobile number check) and Cash-on-Delivery payment selection. Profile dashboard lists placed orders, current fulfillment status, and order cancellation capabilities.

### 🛡️ Administrative Panel
* **High-Contrast Dark Theme:** Adapts the entire application body to a dark dashboard layout using dynamic CSS class injection (`.admin-theme`) based on routing and authentication roles.
* **Real-time Analytics Widgets:** Renders counts for total users registered, catalog size, and total order volume.
* **Content Configuration:** Allows on-the-fly updates to the homepage promotional banner image URL and category navigation arrays.
* **Product Stock Management:** Full CRUD interface (Create, Read, Update, Delete) to modify catalog inventory from a tabular list.
* **Order Fulfillment Pipeline:** Updates order statuses (`order placed`, `in transit`, `delivered`, `cancelled`) directly in the database.

---

## 🛠️ Technology Stack

| Tier | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), React Router v6, Lucide React, Vanilla CSS (Variables, Glassmorphism) | Single Page Application (SPA), state sync, and premium responsive layout UI |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs | REST API routing, authentication middleware, password hashing, and role checks |
| **Database** | MongoDB Atlas, Mongoose ORM, Database Proxy fallbacks | Cloud database collections and local mockup fallbacks for testing stability |

---

## 📂 Folder Structure

```
ShopEZ/
├── client/                  # React Frontend (Vite)
│   ├── index.html           # HTML5 entry & SEO metadata
│   ├── package.json         # Client dependencies & scripts
│   └── src/
│       ├── main.jsx         # React application mounting point
│       ├── App.jsx          # Routing & global navigation header
│       ├── api.js           # Fetch API service integration layer
│       ├── index.css        # Vanilla CSS styling variables, dark theme overlay
│       └── pages/           # Screen views (Catalog, Details, Cart, Checkout, Profile, Admin Dashboard, Login/Register)
│
├── server/                  # Node.js Express Backend
│   ├── server.js            # Express server entry point & DB connection
│   ├── package.json         # Server dependencies & ES modules config
│   ├── middleware/
│   │   └── auth.js          # JWT parsing and admin authorization filters
│   ├── models/
│   │   └── Schema.js        # Mongoose database models & mock fallbacks
│   ├── controllers/         # Request handling logic (auth, cart, order, product, admin)
│   └── routes/              # Express API endpoints
│
└── MERN Phase Wise/         # Project documentation, PDF templates, and planning materials
```

---

## ⚙️ Setup & Configuration

### Prerequisites
* **Node.js**: v16 or higher (v18+ recommended)
* **npm**: v8 or higher
* **MongoDB**: A running local MongoDB community server or a MongoDB Atlas cloud cluster.

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Shashank-0075/VIP-C2-ShopEZ.git
   cd ShopEZ
   ```

2. **Configure Backend Environment:**
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_secret_key
   ```

3. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## 🏃 Running the Application

To run the application locally, start both the backend server and frontend client in separate terminals:

* **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   *(Server starts on `http://localhost:8000`)*

* **Start Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   *(Vite development server runs on `http://localhost:5173`)*

---

## 🔒 Security & Middleware
* **Password Hashing:** Passwords are encrypted with a 10-round salt factor using `bcryptjs` before storage.
* **Stateless Auth:** Decoded JWT objects are signed on login/register and stored in the browser's `localStorage` as an Authorization Bearer header.
* **Role Verification:** Endpoints starting with `/api/admin` enforce role checks. Only accounts with `usertype: "Admin"` are granted access, returning `403 Forbidden` responses for standard shoppers.
