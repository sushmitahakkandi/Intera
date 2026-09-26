# Intera: An Intelligent Furniture E-Commerce Platform with AI-Powered Interior Design and Recommendation System

Intera is a modern furniture e-commerce platform that combines online furniture shopping with intelligent room analysis, automated furniture compatibility recommendations, and an interactive AI Shopping Assistant.

---

## 📌 Project Overview

**Intera** bridges the gap between traditional online furniture shopping and personalized interior design. Choosing furniture online often leads to mismatches in room dimensions, style conflicts, and color disharmony because customers cannot easily visualize how pieces will fit into their actual living spaces.

### The Problem with Traditional Furniture E-Commerce
* **Spatial Uncertainty:** Buyers struggle to estimate whether furniture dimensions fit their available floor space and ceiling heights.
* **Aesthetic Misalignment:** Products that look appealing in isolation often clash with existing room lighting, wall colors, and flooring.
* **Decision Fatigue:** Customers are overwhelmed by large catalogs without personalized curation tailored to their specific room type.

### How Intera Solves It
Intera enhances the shopping experience through:
* **AI Room Image Analysis:** Users upload a photograph of their room to automatically identify room type, ambient lighting, dominant color palettes, detected materials, and free floor space.
* **Personalized Furniture Recommendations:** Multi-factor compatibility engines match catalog items against the detected room style, spatial constraints, and user budget preferences.
* **AI Shopping Assistant:** An intelligent conversational assistant guides users, answers queries about dimensions and materials, helps compare products, and plans room budgets.
* **Centralized Admin Dashboard:** A comprehensive administrative console to manage products, categories, orders, bulk data imports/exports, customer reviews, promotional coupons, and business analytics.

---

## ✨ Key Features

### Customer Features
* **User Registration & Authentication:** Secure email/password signup and login with JWT tokens and phone-based OTP verification.
* **Product Browsing & Discovery:** Browse products with instant search, category filtering, subcategory views, material filtering, and color selection.
* **Product Details:** Multi-angle image views (front, side, back, top, lifestyle, dimensions), stock availability, technical specifications, dimensions, warranty, and customer reviews.
* **Interactive Wishlist:** Save preferred furniture items across browsing sessions.
* **Shopping Cart & Live Calculation:** Dynamic cart calculations including discounts, applicable taxes (GST), and delivery charges.
* **Promotional Coupons:** Validate and apply promotional discount codes during checkout.
* **Checkout & Order Placement:** Flexible checkout with multi-step shipping address entry and Cash on Delivery (COD) / digital payment flow.
* **Order Tracking & Invoicing:** Real-time multi-stage order tracking (Pending, Confirmed, Processing, Packed, Shipped, Out For Delivery, Delivered) and downloadable PDF invoices.
* **Customer Reviews & Ratings:** Verified buyer ratings, photo reviews, and merchant response views.
* **Customer Profile:** Manage account details, saved delivery addresses, active orders, and analysis history.

### Intelligent Features
* **AI Room Vision Analysis:** Upload room photos analyzed via Google Gemini 1.5 Flash with fallback rule-based spatial processing.
* **Style & Palette Detection:** Automatically detects room style (Modern, Luxury, Minimalist, Classic, Industrial, Scandinavian), wall colors, and flooring types.
* **Compatibility Scoring Engine:** Calculates compatibility scores based on color harmony, spatial constraints, material matching, and budget limits.
* **Room Layout & Space Optimization Tips:** Generates practical interior layout suggestions and identifies missing furniture items.
* **AI Shopping Assistant:** Context-aware chatbot providing real-time product recommendations, side-by-side product comparisons, and room budget calculations.
* **AI Review Moderation & Sentiment:** Automated review sentiment analysis and AI-assisted merchant replies.
* **AI Coupon Generation:** Administrative utility to generate smart promotional discounts based on business rules.

### Admin Features
* **Secure Admin Authentication:** Role-based access control (RBAC) protecting administrative routes and dashboard metrics.
* **Real-time Analytics Dashboard:** Summary metrics for total revenue, active orders, customer count, low-stock alerts, and catalog size.
* **Product Management:** Full CRUD operations for products with multi-view image upload and status toggles (Active/Inactive, Featured, Best Seller, AI-Eligible).
* **Category & Metadata Management:** Manage furniture categories, brands, materials, and colors.
* **Bulk Data Operations:** Bulk product import via CSV, Excel, and JSON files, bulk image upload and SKU mapping, and catalog export.
* **Order Management & Fulfillment:** Update order statuses, assign tracking numbers and courier details, handle return requests, and process refunds.
* **Customer Management:** View registered customers, account statuses, and toggle account activation.
* **Review Moderation:** Approve, reject, reply to customer reviews, and inspect AI-extracted sentiment.
* **Coupon & Promotion Management:** Create fixed/percentage discount coupons, set validity periods, and toggle active statuses.
* **System Notifications:** Broadcast real-time alerts via Socket.io for order status changes and catalog updates.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React.js (v18)** | Declarative UI component library |
| **Vite (v5)** | Fast frontend build tool and development server |
| **Tailwind CSS (v3)** | Utility-first styling framework |
| **Framer Motion** | Smooth animations and micro-interactions |
| **React Router DOM (v6)** | Client-side routing and protected routes |
| **Axios** | HTTP client for backend REST API communication |
| **Recharts** | Data visualization charts for analytics |
| **Socket.io Client** | Real-time WebSocket event listener |
| **React Hook Form** | Form validation and state management |
| **React Hot Toast & React Icons** | UI toast notifications and iconography |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime environment |
| **Express.js (v4)** | RESTful API routing and middleware framework |
| **Mongoose (v8)** | Object Data Modeling (ODM) library for MongoDB |
| **Socket.io (v4)** | Real-time bidirectional event-based communication |
| **Multer** | Multipart/form-data middleware for file uploads |
| **Sharp** | Image processing, resizing, and WebP compression |
| **PDFKit** | Dynamic PDF generation for order invoices |
| **XLSX & CSV-Parser** | Spreadsheet parsing for bulk catalog operations |
| **BcryptJS & JWT** | Password hashing and JSON Web Token authentication |

### Database
* **MongoDB:** NoSQL document database storing users, products, orders, reviews, coupons, AI sessions, and room analysis records.

### AI & Intelligent Processing
* **Google Generative AI SDK (`@google/generative-ai` - Gemini 1.5 Flash):** Computer vision room image analysis, feature extraction, and AI assistant dialogues.
* **Algorithmic Compatibility & Recommendation Engines:** Custom algorithmic engines for spatial analysis, color harmony, material detection, and confidence scoring.

### Cloud Storage
* **AWS S3 (`@aws-sdk/client-s3`):** Secure cloud object storage for product multi-view images, category thumbnails, and uploaded room analysis images (with local fallback).

### Development & Build Tools
* **npm Workspaces:** Unified monorepo structure managing dependencies across frontend and backend.
* **Nodemon:** Hot-reloading development server for Node.js.
* **Git & GitHub:** Version control and source code repository management.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Client Layer                         │
│   ┌─────────────────────────┐ ┌────────────────────┐   │
│   │  Customer Storefront    │ │  Admin Dashboard   │   │
│   │  (React.js + Vite)      │ │  (React.js + Vite) │   │
│   └───────────┬─────────────┘ └─────────┬──────────┘   │
└───────────────┼─────────────────────────┼──────────────┘
                │   HTTP REST / WebSocket │
                ▼                         ▼
┌────────────────────────────────────────────────────────┐
│                   Backend Layer                        │
│            Node.js + Express.js REST API               │
│                                                        │
│  ┌───────────────────────┐   ┌───────────────────────┐ │
│  │   Auth & RBAC Guards  │   │  Socket.io Dispatcher │ │
│  └───────────────────────┘   └───────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │               Business Logic Services             │ │
│  │   • Product & Order Management                    │ │
│  │   • Bulk Import / Export & PDF Invoicing          │ │
│  │   • AI Vision & Assistant Engines                 │ │
│  │   • Storage Abstraction Layer (S3 / Local)        │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────┬─────────────────────────┬──────────────┘
                │                         │
                ▼                         ▼
┌─────────────────────────────┐ ┌────────────────────────┐
│       Database Layer        │ │   External Services    │
│                             │ │                        │
│      MongoDB Database       │ │   • AWS S3 Bucket      │
│   (Mongoose ODM Schemas)    │ │   • Google Gemini API  │
└─────────────────────────────┘ └────────────────────────┘
```

---

## 📦 Project Modules

### 1. User & Authentication Module
Manages customer and admin accounts, password hashing with bcrypt, JWT token generation, role verification (`customer` vs `admin`), phone OTP verification, and saved shipping addresses.

### 2. Product & Catalog Module
Handles product creation, updates, multi-view image sets (front, side, top, lifestyle, dimension), category/brand/material tagging, SKU indexing, and stock tracking.

### 3. AI Room Analysis Module
Accepts room photo uploads, compresses them via Sharp, securely uploads to S3, and parses the image with Google Gemini 1.5 Flash to extract room dimensions, style, palette, and lighting conditions.

### 4. Furniture Recommendation Engine
A multi-stage recommendation pipeline that scores catalog products against room attributes using style compatibility, color harmony matrices, dimension constraints, and user budget preferences.

### 5. AI Shopping Assistant Module
An interactive conversational assistant that maintains chat sessions, provides contextual furniture advice, compares products side-by-side, suggests room bundles, and records engagement metrics.

### 6. Cart & Wishlist Module
Persistent state management allowing customers to save products for later, update quantities, view real-time subtotal calculations, and transition smoothly to checkout.

### 7. Order & Fulfillment Module
Processes orders with unique invoice numbers, records customer delivery details, calculates GST, maintains chronological status timelines, and generates downloadable PDF invoices.

### 8. Bulk Operations Module
Enables administrators to batch upload products through CSV, Excel, and JSON files, map bulk image directories to SKUs, perform catalog updates, and download import audit reports.

### 9. Reviews & Ratings Module
Allows authenticated buyers to post product ratings and reviews. Admin tools allow review moderation, AI sentiment analysis, and official merchant replies.

### 10. Business Analytics & Admin Module
Aggregates sales metrics, category distribution, recent orders, inventory warnings, coupon redemptions, and assistant conversion metrics.

---

## 📂 Project Structure

```text
Major_project_MHV/
│
├── frontend/
│   ├── user-app/                   # Customer storefront application
│   │   ├── src/
│   │   │   ├── assets/             # Client-side static assets
│   │   │   ├── components/         # Reusable UI components (Navbar, Footer, Cards)
│   │   │   ├── context/            # AppContext (Auth, Cart, Wishlist, Store state)
│   │   │   ├── pages/              # Storefront views (Home, Shop, ProductDetails,
│   │   │   │                       # AIRoomRecommendation, AIAssistant, Cart, Checkout,
│   │   │   │                       # Orders, OrderTracking, Profile, Reviews, etc.)
│   │   │   ├── routes/             # App routing definitions
│   │   │   ├── services/           # Axios API services
│   │   │   ├── App.jsx             # Root user app component
│   │   │   └── main.jsx            # Entry point
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── admin-app/                  # Administrator portal
│   │   ├── src/
│   │   │   ├── components/         # Admin components (Sidebar, Topbar, Modals, Tables)
│   │   │   ├── pages/              # Admin views (Dashboard, Products, AddProduct,
│   │   │   │                       # EditProduct, Categories, Inventory, Orders,
│   │   │   │                       # OrderDetail, BulkOperations, Customers, Reviews,
│   │   │   │                       # Coupons, Analytics, Settings, etc.)
│   │   │   ├── services/           # Admin API clients
│   │   │   ├── App.jsx             # Root admin app component
│   │   │   └── main.jsx            # Entry point
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── shared/                     # Shared UI components and configurations
│
├── backend/
│   ├── config/                     # Configuration modules
│   │   ├── cloud/                  # AWS S3 client configuration (s3.js)
│   │   ├── db/                     # MongoDB connection configs
│   │   ├── jwt/                    # JWT secret and token helpers
│   │   └── multer/                 # Multer memory storage and upload limits
│   ├── controllers/                # Request handlers
│   │   ├── auth/                   # Registration, login, OTP, profile
│   │   ├── product/                # Product CRUD and search
│   │   ├── order/                  # Order placement, status update, PDF invoice
│   │   ├── bulk/                   # Excel/CSV validation, image mapping, export
│   │   ├── review/                 # Review creation, moderation, merchant reply
│   │   ├── coupon/                 # Coupon validation, creation, AI generation
│   │   ├── analytics/              # Dashboard aggregations and reports
│   │   ├── notification/           # System notifications
│   │   └── user/                   # Customer list and status management
│   ├── middleware/                 # AuthMiddleware (JWT), admin check, error handlers
│   ├── models/                     # Mongoose schema definitions
│   │   ├── User/                   # Customer & Admin accounts
│   │   ├── Product/                # Products, specifications, image URLs
│   │   ├── Order/                  # Orders, item lists, status timeline, shipping
│   │   ├── Category/               # Category definitions
│   │   ├── Brand/                  # Furniture brand metadata
│   │   ├── Color/                  # Color swatches and hex values
│   │   ├── Material/               # Material types
│   │   ├── Review/                 # Customer reviews and AI sentiment
│   │   ├── Coupon/                 # Discount codes and rules
│   │   ├── Notification/           # User and admin notifications
│   │   ├── RoomAnalysis/           # Uploaded room analysis records
│   │   ├── ColorDesignAnalysis/    # Room color schemes & design layouts
│   │   ├── AssistantSession/       # AI chat history logs
│   │   ├── AssistantAnalytics/     # AI assistant interaction analytics
│   │   └── ImportHistory/          # Bulk catalog import audit logs
│   ├── modules/
│   │   └── ai/                     # AI & recommendation subsystems
│   │       ├── roomRecommendation/ # Gemini vision analyzer & compatibility engines
│   │       ├── assistant/          # AI Shopping Assistant & budget planner
│   │       └── colorAdvisor/       # Color matching & layout coordinate advisor
│   ├── routes/                     # Express REST route mounts
│   ├── services/                   # StorageService (S3/local), PDF generator, etc.
│   ├── seeders/                    # Database seeding and demo scripts
│   ├── app.js                      # Express application setup and route registration
│   ├── server.js                   # HTTP server & Socket.io initialization
│   └── package.json
│
├── assets/                         # Project graphics, logos, and screenshots
├── database/                       # Database backups, seeds, and schema docs
├── docs/                           # Technical documentation, API specs, diagrams
├── package.json                    # Root npm workspace configuration
└── README.md                       # Project documentation
```

---

## 🗄️ Database Design

Intera uses **MongoDB** with Mongoose ODM schemas. The primary collections are:

| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| **`users`** | Registered customers and system administrators | `name`, `email`, `password`, `role`, `status`, `phone`, `otpCode`, `otpExpiry` |
| **`products`** | Furniture catalog items with specifications | `name`, `sku`, `brand`, `category`, `price`, `discountPrice`, `stock`, `material`, `color`, `dimensions`, `images`, `thumbnail`, `status` |
| **`categories`** | Top-level furniture classifications | `name`, `slug`, `image`, `description`, `isActive` |
| **`brands`** | Furniture manufacturers and brand names | `name`, `logo`, `description` |
| **`materials`** | Material types (Wood, Fabric, Metal, Leather, etc.) | `name`, `description` |
| **`colors`** | Color options and hex representations | `name`, `hex` |
| **`orders`** | Customer purchases and shipment lifecycle | `orderId`, `invoiceNumber`, `customer`, `items`, `subtotal`, `gst`, `total`, `status`, `paymentMethod`, `statusTimeline`, `shippingAddress` |
| **`roomanalyses`** | Results of AI room vision processing | `userId`, `roomImage`, `awsUrl`, `roomType`, `detectedStyle`, `detectedColors`, `recommendedProducts`, `overallConfidence` |
| **`colordesignanalyses`** | AI color matching and 2D spatial layouts | `userId`, `roomImage`, `detectedPalette`, `layoutCoordinates` |
| **`assistantsessions`** | Conversational history with the AI Assistant | `userId`, `sessionId`, `messages`, `contextData` |
| **`assistantanalytics`** | AI assistant usage and query conversions | `queryType`, `productsSuggested`, `convertedToCart` |
| **`reviews`** | Customer feedback and AI sentiment analyses | `product`, `user`, `rating`, `comment`, `status`, `sentiment`, `merchantReply` |
| **`coupons`** | Promotional codes and discount rules | `code`, `discountType`, `discountValue`, `minOrderValue`, `startDate`, `endDate`, `status` |
| **`notifications`** | Real-time system and operational alerts | `recipient`, `title`, `message`, `type`, `isRead` |
| **`importhistories`** | Audit logs for bulk CSV/Excel product imports | `fileName`, `totalRows`, `importedCount`, `errorCount`, `uploadedBy`, `reportUrl` |

---

## ☁️ Cloud Storage

Intera integrates with **AWS S3** (`@aws-sdk/client-s3`) through a centralized storage service (`backend/services/storageService.js`) with an automatic local storage fallback:

* **Product Images:** High-resolution multi-view product images (front, side, top, lifestyle, material details) are converted to compressed `.webp` format using **Sharp** before upload.
* **Uploaded Room Images:** Room photos submitted by customers for AI room analysis are stored in S3 buckets and linked to their analysis records.
* **Category & Media Assets:** Storefront banners and category icons are served from cloud storage.

---

## 🤖 AI Recommendation Workflow

```text
   User uploads room image
              │
              ▼
   Sharp compresses image to WebP
              │
              ▼
   Image uploaded to AWS S3
              │
              ▼
   Google Gemini 1.5 Flash Vision Engine
   (Extracts: Room Type, Style, Palette, Materials, Space & Dimensions)
              │
              ▼
   Rule-Based Compatibility & Scoring Engines
   (Calculates harmony score across style, color, dimensions & budget)
              │
              ▼
   Catalog Query & Product Matching
              │
              ▼
   Curated Recommendations & Space Tips returned to User
```

1. **Image Upload:** The user uploads a room photograph from the storefront.
2. **Preprocessing & Storage:** The server resizes and converts the image to WebP using Sharp and persists it to AWS S3.
3. **Computer Vision Feature Extraction:** The image buffer is passed to Google Gemini 1.5 Flash to extract room attributes (room type, architectural style, dominant colors, flooring type, ambient light, and free space).
4. **Algorithmic Compatibility Scoring:** Specialized internal engines (`colorHarmonyEngine`, `furnitureCompatibilityEngine`, `spatialAnalysisEngine`) score catalog items against the detected attributes.
5. **Personalized Results:** The user receives categorized product recommendations, layout tips, and budget options directly on the storefront.

---

## 👤 User Workflow

```text
Register / Login
       ↓
Browse Catalog & Filter (Category / Color / Material / Price)
       ↓
View Product Details (Specifications, Multi-angle Views, Reviews)
       ↓
Upload Room Photo ──► AI Room Analysis ──► View Recommended Furniture
       ↓
Interact with AI Shopping Assistant for Advice & Budget Planning
       ↓
Add Items to Wishlist / Cart
       ↓
Apply Promotional Coupon Code
       ↓
Proceed to Checkout (Enter Shipping Address & Select Payment)
       ↓
Place Order & Receive Unique Invoice Number
       ↓
Track Order Status & Download PDF Invoice
       ↓
Submit Product Review & Rating
```

---

## 👨‍💼 Admin Workflow

```text
Admin Login
       ↓
Dashboard Overview (Revenue, Orders, Low Stock, Catalog Metrics)
       ↓
┌─────────────────┬──────────────────┬──────────────────┐
│ Product Mgmt    │ Order Management │ Bulk Operations  │
│ (Add/Edit/Del,  │ (Timeline status,│ (CSV/Excel import│
│ Multi-view imgs)│ Courier, Invoices│ Bulk img mapping)│
└────────┬────────┴────────┬─────────┴────────┬─────────┘
         │                 │                  │
┌────────┴────────┬────────┴─────────┬────────┴─────────┐
│ Review Mod.     │ Coupon Mgmt      │ Customer Mgmt    │
│ (AI sentiment,  │ (Create, Toggle, │ (View buyers,    │
│ Merchant reply) │ AI Coupon tool)  │ Toggle status)   │
└─────────────────┴──────────────────┴──────────────────┘
```

---

## 🔌 Backend and API

The backend is built with **Node.js** and **Express.js**, following a modular controller-service-repository pattern.

### Key API Groups & Endpoints

#### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create customer account
* `POST /api/auth/login` - Authenticate user & issue JWT token
* `GET  /api/auth/me` - Fetch authenticated user profile
* `POST /api/auth/forgot-password-phone` - Request OTP for password reset
* `POST /api/auth/verify-otp-phone` - Verify phone OTP
* `POST /api/auth/reset-password-phone` - Reset password with verified OTP

#### Products (`/api/products`)
* `GET    /api/products` - List products with pagination, search, and category filters
* `GET    /api/products/search` - Search products by keyword
* `GET    /api/products/:id` - Fetch single product details
* `POST   /api/products` - Create new product *(Admin only)*
* `PUT    /api/products/:id` - Update product details *(Admin only)*
* `DELETE /api/products/:id` - Remove product *(Admin only)*
* `PATCH  /api/products/status` - Toggle product active status *(Admin only)*

#### AI & Room Analysis (`/api/ai`)
* `POST   /api/ai/room/upload` - Upload room image for Gemini vision analysis & recommendations
* `GET    /api/ai/history` - Retrieve customer room analysis history
* `DELETE /api/ai/history/:id` - Remove analysis history item
* `POST   /api/ai/color/upload` - Analyze room color palette and design layout
* `GET    /api/ai/color/history` - Fetch color analysis history
* `PUT    /api/ai/color/design/:id` - Save custom 2D design layout coordinates

#### AI Shopping Assistant (`/api/assistant`)
* `POST   /api/assistant/chat` - Send conversational prompt to AI Shopping Assistant
* `GET    /api/assistant/sessions` - Retrieve past assistant chat sessions
* `DELETE /api/assistant/sessions/:id` - Delete assistant chat session
* `POST   /api/assistant/sessions/:id/feedback` - Submit session rating
* `GET    /api/assistant/analytics` - View assistant metrics *(Admin only)*

#### Orders (`/api/orders`)
* `POST  /api/orders` - Place new order (Customer or Guest checkout)
* `GET   /api/orders` - List customer orders or all orders *(Admin)*
* `GET   /api/orders/:id` - Get order details
* `PATCH /api/orders/status` - Update order stage timeline *(Admin only)*
* `PATCH /api/orders/cancel` - Cancel active order
* `PATCH /api/orders/return` - Request or process order return
* `PATCH /api/orders/refund` - Process order refund *(Admin only)*
* `GET   /api/orders/tracking/:id` - Retrieve real-time tracking information
* `GET   /api/orders/invoice/:id` - Stream generated PDF invoice

#### Bulk Operations (`/api/bulk`)
* `POST /api/bulk/validate-file` - Validate CSV/Excel data structure *(Admin only)*
* `POST /api/bulk/execute-import` - Execute batch product creation *(Admin only)*
* `POST /api/bulk/map-images` - Bulk upload and assign images to SKUs *(Admin only)*
* `GET  /api/bulk/export` - Export catalog as spreadsheet *(Admin only)*
* `GET  /api/bulk/history` - View bulk import history audit logs *(Admin only)*
* `GET  /api/bulk/history/:id/report` - Download import report *(Admin only)*

#### Coupons (`/api/coupons`)
* `GET    /api/coupons` - List all coupons *(Admin only)*
* `GET    /api/coupons/active` - Retrieve active storefront coupons
* `POST   /api/coupons/validate` - Validate coupon code against cart total
* `POST   /api/coupons` - Create new coupon *(Admin only)*
* `PUT    /api/coupons/:id/status` - Toggle coupon active state *(Admin only)*
* `DELETE /api/coupons/:id` - Delete coupon *(Admin only)*
* `POST   /api/coupons/generate-ai` - Generate coupon with AI *(Admin only)*

#### Reviews (`/api/reviews`)
* `GET    /api/reviews` - List all reviews for moderation *(Admin only)*
* `POST   /api/reviews` - Submit product review (Verified buyers)
* `GET    /api/reviews/my` - Fetch current user's submitted reviews
* `PUT    /api/reviews/:id/status` - Moderate review status *(Admin only)*
* `PUT    /api/reviews/:id/reply` - Post merchant reply *(Admin only)*
* `POST   /api/reviews/:id/analyze` - Trigger AI sentiment evaluation *(Admin only)*

#### Analytics, Users, & Notifications
* `GET /api/analytics` - Aggregated business metrics *(Admin only)*
* `GET /api/meta` - Global metadata (Categories, Brands, Materials, Colors)
* `GET /api/meta/dashboard` - Quick administrative dashboard KPIs *(Admin only)*
* `GET /api/users` - Searchable customer accounts listing *(Admin only)*
* `PUT /api/users/:id/status` - Toggle customer account status *(Admin only)*
* `GET /api/notifications` - Retrieve notifications
* `PUT /api/notifications/mark-read` - Mark all notifications as read

---

## 🔐 Authentication and Security

* **JSON Web Tokens (JWT):** Stateless authentication using signed JWT tokens stored securely on the client.
* **Role-Based Access Control (RBAC):** Middleware (`authMiddleware`, `adminMiddleware`, `softAuthMiddleware`) protects sensitive administrative and customer routes.
* **Password Encryption:** Passwords hashed with **BcryptJS** with salt rounds before database persistence.
* **Secure File Uploads:** Upload limits enforced via Multer, image validation, and sanitization via Sharp.
* **CORS & Environment Isolation:** Cross-Origin Resource Sharing configured for specific origins and credentials stored in isolated `.env` configuration files.

---

## ⚙️ Setup and Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* **MongoDB** (Local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI)
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/sushmitahakkandi/Major_project_MHV.git
cd Major_project_MHV
```

### 2. Install Dependencies
Install dependencies across all workspaces from the project root:
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` files in the respective directories according to the templates below.

#### Backend Configuration (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mhv_furniture
JWT_SECRET=your_secure_jwt_secret_key
BACKEND_URL=http://localhost:5000
STORAGE_PROVIDER=local

# Optional: AWS S3 Configuration (if STORAGE_PROVIDER=s3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_s3_bucket_name

# Optional: Google Gemini API (for AI Room Vision & Assistant)
GEMINI_API_KEY=your_gemini_api_key
```

#### User Frontend Configuration (`frontend/user-app/.env`):
```env
VITE_API_URL=http://localhost:5000
```

#### Admin Frontend Configuration (`frontend/admin-app/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the Development Servers
You can start all services concurrently from the root directory:
```bash
npm run dev
```

Or run each service individually in separate terminals:

* **Backend API Server:**
  ```bash
  npm run dev:backend
  # Server runs on http://localhost:5000
  ```
* **Customer Storefront:**
  ```bash
  npm run dev:user
  # Storefront runs on http://localhost:5173
  ```
* **Admin Dashboard:**
  ```bash
  npm run dev:admin
  # Admin portal runs on http://localhost:5174
  ```

---

## 🔑 Environment Configuration

Sensitive credentials, database connection strings, and secret keys must remain in `.env` files and should never be committed to version control. Ensure your `.gitignore` includes:
```gitignore
node_modules/
.env
.env.local
dist/
uploads/
```

---

## 🧪 Testing

The platform has been validated through systematic functional and integration testing:
* **Authentication & RBAC:** Verified registration, token expiration, OTP verification, and administrative route guards.
* **E-Commerce Flows:** Tested product catalog filtering, cart state mutations, coupon application logic, checkout processes, and order tracking timelines.
* **PDF Invoice Engine:** Validated dynamic invoice generation and streaming via PDFKit.
* **Bulk Data Pipelines:** Validated spreadsheet schema verification, error reporting for invalid rows, and image-to-SKU mapping.
* **AI & Recommendation Verification:** Tested Gemini 1.5 Flash vision analysis and validated rule-based fallback engines when running without external API keys.
* **Socket.io Events:** Verified real-time broadcast of catalog updates and order status changes between the admin panel and user app.

---

## 📱 Responsive Design

The frontend interfaces are built with **Tailwind CSS** and are fully responsive across:
* **Desktop & Large Displays** (1280px+)
* **Laptops & Tablets** (768px - 1024px)
* **Mobile Devices** (320px - 640px)

Key responsive elements include mobile navigation drawers, collapsible admin sidebars, flexible CSS grid product catalogs, dynamic tables, and touch-friendly checkout flows.

---

## 🚀 Deployment

The project is architected for modular cloud deployment:
* **Frontend Applications:** Can be built as static SPAs using `npm run build:user` and `npm run build:admin`, and deployed to static hosting platforms such as **Netlify** or **Vercel**.
* **Backend REST API:** Can be hosted on Node.js application platforms such as **Render**, **Railway**, **AWS EC2**, or **Heroku**.
* **Database & Cloud Storage:** Hosted on **MongoDB Atlas** and **AWS S3**.

---

## 🖼️ Screenshots

> *Screenshots of the Intera platform can be placed in the `assets/Screenshots/` directory.*

* **Customer Storefront:** Home page, category browsing, and interactive search.
* **Product Details View:** Multi-angle image viewer, technical specs, and customer reviews.
* **AI Room Recommendation:** Uploaded room photo, detected palette, and matched furniture items.
* **AI Shopping Assistant:** Conversational product recommendations and budget planning.
* **Admin Dashboard:** Real-time business KPIs, catalog manager, and bulk CSV/Excel import center.
* **Order Management & Tracking:** Fulfillment status timeline and PDF invoice viewer.

---

## 🔮 Future Enhancements

* **3D Room & AR Visualization:** Augmented reality preview allowing customers to project 3D models of furniture directly into their room using WebXR.
* **Payment Gateway Integration:** Direct payment integration with Razorpay / Stripe for online card and UPI transactions.
* **Demand Forecasting:** Machine learning models analyzing seasonal purchasing trends to optimize inventory restocking.
* **Mobile App:** Native mobile application built with React Native for iOS and Android.

---

## 📌 Project Status

This project is developed as part of an **MCA (Master of Computer Applications) Final-Year Project**. The core e-commerce, administrative management, AWS S3 storage integration, and AI recommendation systems are fully functional.

---

## 📄 License

This project is developed as part of an MCA final-year academic project.

---

## 👥 Contributors

* **Sushmita Hakkandi** ([@sushmitahakkandi](https://github.com/sushmitahakkandi))
