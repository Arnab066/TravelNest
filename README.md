# TravelNest – Property Booking Platform

TravelNest is a premium, full-stack vacation rental and lodging reservation platform. Built using **Node.js**, **Express**, **React.js**, and a **dual-mode Database adapter (MongoDB / Local JSON Database)**, TravelNest offers a responsive interface with role-based access for guests and hosts.

---

## ✨ Features

### 👤 Guest Experience
*   **Property Discovery**: Browse dynamic feeds, switch property categories, and search listings by location keywords.
*   **Interactive Booking System**: Calculate checkout prices instantly using check-in/check-out dates and guest counters.
*   **Stays Dashboard**: Track active reservations, see real-time statuses (Pending, Confirmed, Cancelled), and cancel requests.
*   **Verified Reviews**: Submit 1-to-5 star ratings and written feedback linked directly to confirmed stays.

### 🔑 Host Experience
*   **Host Control Panel**: Dedicated dashboard to monitor owned listings and handle reservation requests.
*   **Listing Management**: Form validations to list new properties, choose categories, upload cover photos, set rates, and customize guest limits/bedroom details.
*   **Reservation Moderation**: Approve or decline incoming booking requests from guests.
*   **Instant Recalculation**: Automated average score aggregates updated whenever guests submit reviews.

### ⚙️ Core Engineering
*   **Dual-Mode Database Layer**: Dynamically connects to **MongoDB (via Mongoose)** if a connection string is supplied. If not, it falls back to a **Local JSON File-based Database (`local_db.json`)**, ensuring the project runs out of the box with zero external configuration!
*   **JWT User Authentication**: Encrypted password hashing and stateless authorization middleware.
*   **Modular Component Design**: Custom-coded routing and responsive styles using **Vanilla CSS with CSS Custom Properties** for premium visual quality.

---

## 💻 Tech Stack

*   **Frontend**: React.js (Vite compiler), Lucide React (vector iconography), Vanilla CSS
*   **Backend**: Node.js, Express.js, JWT Auth (`jsonwebtoken`), Password encryption (`bcryptjs`)
*   **Database**: MongoDB (via Mongoose) OR server-side local JSON fallback adapter
*   **Process Concurrency**: Concurrently, Nodemon

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

Create a `.env` file inside the `backend/` directory (you can copy `backend/.env.example`):

```env
PORT=5000
JWT_SECRET=your_custom_secret_key_here

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

*   **Frontend Client**: http://localhost:5173/
*   **Backend REST API**: http://localhost:5000/

---

## 🔑 Demo Credentials

To test the application flows instantly, use these seeded user credentials:

*   **Host Account**:
    *   **Email**: `host@travelnest.com`
    *   **Password**: `password123`
*   **Guest Account**:
    *   **Email**: `guest@travelnest.com`
    *   **Password**: `password123`
