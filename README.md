# 🏠 TravelNest – Property Booking Platform

TravelNest is a premium, modern, full-stack vacation rental and lodging reservation platform. Built as a monorepo, TravelNest offers a fully responsive interface with distinct role-based journeys for guests and hosts.

<div align="left">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

---

## ✨ Features at a Glance

### 👤 Guest Experience
*   🔍 **Property Discovery**: Browse dynamic feeds, switch property categories, and search listings by location keywords.
*   📅 **Interactive Booking**: Calculate checkout prices instantly using check-in/check-out dates and guest counters.
*   📊 **Stays Dashboard**: Track active reservations, see real-time statuses (Pending, Confirmed, Cancelled), and request cancellations.
*   ⭐ **Verified Reviews**: Submit 1-to-5 star ratings and written feedback linked directly to confirmed stays.

### 🔑 Host Experience
*   📈 **Host Control Panel**: Dedicated dashboard to monitor owned listings and handle reservation requests.
*   ✏️ **Listing Management**: Dynamic form validations to list new properties, choose categories, upload cover photos, set rates, and customize guest limits/bedroom details.
*   🛠️ **Reservation Moderation**: Approve or decline incoming booking requests from guests.
*   🔄 **Instant Recalculation**: Automated average score aggregates updated whenever guests submit reviews.

### ⚙️ Core Engineering
*   🔌 **Dual-Mode Database Layer**: Dynamically connects to **MongoDB (via Mongoose)** if a connection string is supplied. If not, it falls back to a **Local JSON File-based Database (`local_db.json`)**, ensuring the project runs out of the box with zero external configuration!
*   🛡️ **JWT User Authentication**: Encrypted password hashing and stateless authorization middleware.
*   🎨 **Modular Component Design**: Custom-coded routing and responsive styles using **Vanilla CSS with CSS Custom Properties** for premium visual quality.

---

## 🗺️ System Flowchart

The following diagram illustrates the flow from the client (guest/host) to the backend router, middleware validation, and the dual-mode database engine.

```mermaid
graph TD
    %% Define Nodes and Connections
    subgraph Frontend ["React UI (Vite)"]
        A["App.jsx (State Router)"] --> B["Navbar.jsx"]
        A --> C["Home.jsx (Browse Listings)"]
        A --> D["ListingDetail.jsx (Book / Review)"]
        A --> E["Dashboard.jsx (Host Control / Stays)"]
        F["AuthProvider (Session State)"] -.->|Provides Token & Profile| A
    end

    A -->|Fetch HTTP API Request| G["Express Server (server.js)"]

    subgraph Backend ["Express Backend API"]
        G --> H["Router Manager"]
        H --> H1["/api/auth"]
        H --> H2["/api/listings"]
        H --> H3["/api/bookings"]
        H --> H4["/api/reviews"]

        H3 -->|protect middleware| I["JWT Authenticator"]
        H4 -->|protect middleware| I
    end

    subgraph Controllers ["Controllers & Logic"]
        H1 --> C1["authController.js"]
        H2 --> C2["listingController.js"]
        I -->|If Valid Token| C3["bookingController.js"]
        I -->|If Valid Token| C4["reviewController.js"]
    end

    subgraph DataLayer ["Dual-Mode Database Layer"]
        C1 & C2 & C3 & C4 --> DB_ADAPTER["db.js Adapter Check"]
        DB_ADAPTER -->|MONGO_URI configured| DB_MONGO[("MongoDB via Mongoose")]
        DB_ADAPTER -->|No MONGO_URI env| DB_JSON[("Local JSON File Store (local_db.json)")]
    end
```

---

## 📂 Project Structure

```text
Travelnest/
├── backend/
│   ├── config/          # DB connection & environment setups
│   ├── controllers/     # Authentication, Listing, Booking, and Review controllers
│   ├── middleware/      # Authorization & JWT verification middlewares
│   ├── models/          # Schemas & dbStore unified database adapter
│   ├── routes/          # Express API route endpoints
│   ├── scripts/         # Mock database seeding script
│   └── server.js        # Entry server point
├── frontend/
│   ├── public/          # Static elements
│   ├── src/
│   │   ├── components/  # Navbars, Auth modals, and overlay components
│   │   ├── context/     # Auth Context API session handlers
│   │   ├── pages/       # Home listings feed, details view, guest/host dashboards
│   │   ├── index.css    # Clean global CSS design system
│   │   ├── App.jsx      # Navigation routing controller
│   │   └── main.jsx     # Document mounting root
│   └── index.html       # SEO optimized HTML header shell
└── package.json         # Root manager scripts
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   npm (v9.0.0 or higher)

### 1. Installation
Clone the repository and run the root installation script to download all client, server, and monorepo developer tools:
```bash
npm run install-all
```

### 2. Environment Configuration
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
JWT_SECRET=travelnest_secret_key_123

# Optional: Add MongoDB connection string to use real MongoDB instead of JSON fallback
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### 3. Seed Database
Run the database seed script to populate test accounts and 6 premium sample listings:
```bash
npm run seed --prefix backend
```

### 4. Running Locally
Launch both the Express backend and React Vite frontend concurrently in development mode:
```bash
npm run dev
```
*   **Frontend Client**: `http://localhost:5173/`
*   **Backend REST API**: `http://localhost:5000/`

---

## 🔑 Demo Credentials
To test the application flows instantly, use these seeded user credentials:
*   **Host Account**:
    *   **Email**: `host@travelnest.com`
    *   **Password**: `password123`
*   **Guest Account**:
    *   **Email**: `guest@travelnest.com`
    *   **Password**: `password123`
