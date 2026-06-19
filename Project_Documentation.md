# ShopEZ — Project Documentation
### Full Stack Development with MERN

---

## 1. Introduction
* **Project Title**: ShopEZ
* **Team Members**: Individual
* **Roles & Responsibilities**:
  * **Frontend Development**: React (Vite), UI/UX (Vanilla CSS with Light/Dark themes), Iconography (Lucide React)
  * **Backend Development**: Node.js, Express, REST APIs, Token-based Security
  * **Database Design & Integration**: MongoDB, Mongoose Schemas & Queries
  * **Dashboard, Testing & Documentation**: Admin Dashboard, Routing, E2E Verification & Documentation

---

## 2. Project Overview
**Purpose**:  
ShopEZ is a full-stack, production-ready e-commerce web application built on the MERN stack (MongoDB, Express, React, Node.js). It is tailored to provide a premium shopping experience featuring a custom, responsive design system. Key user flows include registration/login, live product catalog browsing with multi-criteria filtering and sorting, item detail checks with active carousel galleries, cart configuration, and checkout processing. For sellers/admins, the platform includes a dynamic dark-themed dashboard displaying sales metrics, direct catalog stock management (CRUD), and an order fulfillment pipeline.

**Core Features**:
* **Aesthetic Landing Page**: Promotes a high-resolution hero banner (fully dynamic and configurable by admins) and category quick-select tiles.
* **Smart Catalog Filters**: Supports search match (against title and description), checkboxes for categories and gender groups, and radio buttons to sort items by Price (low to high), Price (high to low), Discount, and Popularity.
* **Interactive Product Details**: Displays main product image, thumbnail carousel galleries (clicking swap active view), size selections (S, M, L, XL), quantity adjusters, and CTA actions ("Add to Cart" or "Buy Now").
* **Cart Management**: Isolates shopping carts per user, allowing item quantity increment/decrement, item removal, and full cart clearances. The page dynamically displays an itemized receipt detailing total MRP, discounts, shipping fee savings, and checkout totals.
* **Order Placement & Tracking**: Shipping details entry (Name, Email, Mobile, Address, Pincode) and Cash-on-Delivery payment selection. Profile dashboard lists placed orders, current fulfillment status, and order cancel actions.
* **Unified Admin Panel**: Dark-themed workspace displaying real-time business statistics, banner/category configurator, full product inventory table (add, edit, delete), and order status processors.

---

## 3. Architecture

### Frontend
The frontend is built with **React** (scaffolded via **Vite**) for fast rendering and hot-module replacement. 
* **Styling**: Structured using a custom, responsive **Vanilla CSS system** (`client/src/index.css`) utilizing CSS variables (Light/Dark themes) and micro-interactions/animations for a highly premium, modern look.
* **Routing**: Handled by **React Router v6** to coordinate single-page routing without page reloads.
* **API Communication**: Utilizes the native browser **`fetch` API** with helper wrappers (`client/src/api.js`) to automatically forward JWT session tokens.
* **Icons**: Integrated with **Lucide React**.
* **Global Context**: Managed directly in `App.jsx` using React state hook overrides to distribute logged-in user details and cart metrics.

### Backend
The backend is a RESTful API powered by **Node.js** and **Express.js**.
* **Middleware**: Consists of global JSON parsing, CORS configuration, JWT authentication filters (`server/middleware/auth.js`) to parse sessions, and role checks to restrict administrative routes.
* **Routing**: Organized by domain resources: `/api/auth`, `/api/products`, `/api/cart`, `/api/orders`, and `/api/admin`.
* **Password Security**: Implemented with **`bcryptjs`** for password hashing during user registration and verification during login.

### Database
**MongoDB Atlas** serves as the cloud database, integrated via **Mongoose** models (`server/models/Schema.js`). Key collections are:
* **`users`**: `username`, `email` (marked unique), `password` (hashed), and `usertype` (`Customer` or `Admin`).
* **`admin`**: Homepage layouts including a `banner` image URL and a list of active `categories`.
* **`products`**: `title`, `description`, `mainImg`, `carousel` URL arrays, `sizes` array, `category` type, `gender` tags, `price`, and `discount` percentage.
* **`orders`**: Reference `userId`, recipient contact/shipping info (`name`, `email`, `mobile`, `address`, `pincode`), item characteristics (`title`, `description`, `mainImg`, `size`, `quantity`, `price`, `discount`), transaction details (`paymentMethod`, `orderDate`, `deliveryDate`), and `orderStatus` (`order placed`, `in transit`, `delivered`, `cancelled`).
* **`cart`**: Temp records containing `userId`, product descriptors (`title`, `description`, `mainImg`), shopper specification (`size`, `quantity`), `price`, and `discount`.

---

## 4. Setup Instructions

### Prerequisites
* **Node.js**: v16 or higher (v18+ recommended)
* **npm**: v8 or higher
* **MongoDB**: A running local MongoDB community server or a MongoDB Atlas cloud cluster.
* **Modern Web Browser**: Google Chrome, Firefox, or Edge.

### Installation & Configuration
1. **Navigate to Project Directory**:
   ```powershell
   cd D:\ShopEZ
   ```
2. **Setup Backend Server**:
   Navigate to the `server` directory and install dependencies:
   ```powershell
   cd server
   npm install
   ```
3. **Configure Environment Variables**:
   Create a file named `.env` inside the `server/` directory and configure the environment variables:
   ```ini
   PORT=8000
   MONGO_URI=mongodb+srv://Shashank:%40Shashank@cluster0.0plo9ut.mongodb.net/shopez?appName=Cluster0
   JWT_SECRET=shopez_jwt_secret_key_12345
   ```
4. **Setup Frontend Client**:
   Navigate to the `client` directory and install dependencies:
   ```powershell
   cd ../client
   npm install
   ```

---

## 5. Folder Structure

### Client (React Frontend)
```
client/
├── index.html           # HTML5 entry & SEO meta tags
├── package.json         # Client dependencies and npm scripts
├── src/
│   ├── main.jsx         # React application mounting point
│   ├── App.jsx          # App wrapper, routing, and header nav
│   ├── api.js           # Fetch API service integration layer
│   ├── index.css        # Vanilla CSS variables, themes, animations
│   └── pages/           # Page screen views
│       ├── CatalogPage.jsx
│       ├── ProductDetailsPage.jsx
│       ├── CartPage.jsx
│       ├── CheckoutPage.jsx
│       ├── ProfilePage.jsx
│       ├── AdminDashboard.jsx
│       ├── LoginPage.jsx
│       └── RegisterPage.jsx
```

### Server (Node.js Backend)
```
server/
├── .env                 # Environment secrets and port configurations
├── server.js            # Express app entrypoint & database connection
├── package.json         # Server dependencies & scripts (type: module)
├── middleware/
│   └── auth.js          # Authentication and Admin role validation checks
├── models/
│   └── Schema.js        # Mongoose database models and schemas (Users, Admin, Products, Orders, Cart)
├── controllers/         # Controller functions handling requests
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── adminController.js
└── routes/              # Express API endpoints
    ├── authRoutes.js
    ├── productRoutes.js
    ├── cartRoutes.js
    ├── orderRoutes.js
    └── adminRoutes.js
```

---

## 6. Running the Application

To run the application locally, start both the backend server and frontend client in separate terminals:

* **Backend Server**:
  ```powershell
  cd D:\ShopEZ\server
  npm run dev
  ```
  *(Server runs on `http://localhost:8000`)*

* **Frontend Client**:
  ```powershell
  cd D:\ShopEZ\client
  npm run dev
  ```
  *(Vite development server runs on `http://localhost:5173`)*

---

## 7. API Documentation

Key endpoints exposed by the Node/Express backend:

| Method | Endpoint | Description | Auth Required | Example Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register a new user | No | `{ "token": "...", "user": { "username", "email", "usertype" } }` |
| **POST** | `/api/auth/login` | Authenticate user and return token | No | `{ "token": "...", "user": { "username", "email", "usertype" } }` |
| **GET** | `/api/auth/me` | Fetch logged-in user details | Yes (Token) | `{ "user": { "id", "username", "email", "usertype" } }` |
| **GET** | `/api/products` | Get products (supports sort, search, category, gender query filters) | No | `[ { "_id", "title", "price", "discount", "category" } ]` |
| **GET** | `/api/products/:id` | Fetch details of a single product | No | `{ "_id", "title", "description", "carousel", "sizes" }` |
| **POST** | `/api/products` | Create a new product listing | Yes (Admin) | `{ "message": "Product created", "product": {...} }` |
| **PUT** | `/api/products/:id` | Update an existing product listing | Yes (Admin) | `{ "message": "Product updated", "product": {...} }` |
| **DELETE** | `/api/products/:id` | Remove a product listing | Yes (Admin) | `{ "message": "Product deleted successfully" }` |
| **GET** | `/api/cart` | Get cart items of the current shopper | Yes (Token) | `[ { "_id", "title", "size", "quantity", "price" } ]` |
| **POST** | `/api/cart` | Add/Update item quantity in cart | Yes (Token) | `{ "message": "Cart item updated", "cartItem": {...} }` |
| **DELETE** | `/api/cart/:id` | Remove an item from the cart | Yes (Token) | `{ "message": "Item removed from cart" }` |
| **DELETE** | `/api/cart` | Clear all items from user's cart | Yes (Token) | `{ "message": "Cart cleared successfully" }` |
| **GET** | `/api/orders` | Fetch orders list (Customers see own; Admin sees all) | Yes (Token) | `[ { "_id", "title", "quantity", "orderStatus" } ]` |
| **POST** | `/api/orders` | Confirm checkout & place COD orders | Yes (Token) | `{ "message": "Order placed successfully" }` |
| **PUT** | `/api/orders/:id/status`| Update status of a customer order | Yes (Admin) | `{ "message": "Order status updated successfully", "order" }` |
| **PUT** | `/api/orders/:id/cancel`| Cancel a customer order | Yes (Token) | `{ "message": "Order cancelled successfully", "order" }` |
| **GET** | `/api/admin/config` | Retrieve active banner image and categories | No | `{ "banner": "...", "categories": [...] }` |
| **POST** | `/api/admin/config` | Update active banner URL and categories list | Yes (Admin) | `{ "message": "Configuration updated", "config" }` |
| **GET** | `/api/admin/stats` | Fetch counts for Dashboard statistics | Yes (Admin) | `{ "totalUsers": 1, "totalProducts": 14, "totalOrders": 6 }` |

---

## 8. Authentication

ShopEZ implements stateless **JSON Web Tokens (JWT)** for session authentication. 
1. **Credentials verification**: During registration or login, user passwords are encrypted/verified using `bcryptjs` (10 salt rounds). 
2. **Token generation**: The server generates a JWT containing the user's MongoDB `_id` and signs it using `JWT_SECRET`. 
3. **Session storage**: The client intercepts the token and stores it inside `localStorage` (key: `shopez_token`). 
4. **Header attachment**: For all authenticated client API requests, the token is automatically appended as an `Authorization: Bearer <token>` header.
5. **Authorization checks**: Route endpoints check request headers and extract the token. Routes starting with `/api/admin` or mutative product/order endpoints verify that the `usertype` property in the decoded token is exactly `"Admin"`, otherwise returning a `403 Forbidden` response.
6. **Redirects**: Upon login/registration, users are automatically directed to either the Customer homepage (`/`) or the Admin panel (`/admin`) depending on their `usertype`.

---

## 9. User Interface

The user interface implements a premium look using custom CSS selectors, box shadows, and smooth HSL color transformations:
* **Landing Page / Catalog**: Contains a dynamic, full-width promo banner with CTA buttons, category filter pills (Fashion, Electronics, Mobiles, Groceries, Sports Equipments), and a grid displaying products with titles, price lists, discount percentages, and quick-shop buttons.
* **Product Details Page**: Features a main thumbnail image gallery with instant active swaps, size picker buttons, quantity counters, and direct basket modifiers.
* **Cart View**: Provides quantity controls (+ / -) that directly recalculate invoice fees. Shows a detailed receipt detailing total cost, discounts, and free delivery charges.
* **Checkout Screen**: Incorporates shipping forms with validation and payment selectors.
* **Profile / History**: Features user credential stats and a scrollable stack of order statuses (`order placed`, `in transit`, `delivered`, `cancelled`) with instant cancel capabilities.
* **Admin dashboard**: Instantly shifts the body theme to a dark mode palette (`.admin-theme`). Features analytics metrics (Total Users, All Products, All Orders), banner configurations, and CRUD stock management.

---

## 10. Testing

ShopEZ employs manual User Acceptance Testing (UAT) to verify all critical user flows:
1. **User Sign Up & Login**: Verifies correct credentials input and role-based routing (Customer to homepage, Admin to dark dashboard).
2. **Admin Operations**: Test updating banner images, modifying category arrays, creating new products, updating stock details, and deleting items.
3. **Shopping Experience**: Test typing inside search bars, checking filter checkboxes, and sorting by price/discount.
4. **Checkout flow**: Test selecting sizes, updating item quantities, adding products, viewing cart totals, entering shipping addresses, and confirming Cash-on-Delivery orders.
5. **Order Tracking**: Test order status changes in the Admin Dashboard and verify they are instantly reflected in the customer profile. Test order cancellation.
