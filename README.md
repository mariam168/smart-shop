# 🛍️ Smart Shop - Full-Stack E-commerce Platform

This is a complete e-commerce application built with the MERN stack, featuring a client-facing storefront and a comprehensive admin dashboard for managing the store.

## ✨ Features
- User authentication (Register, Login)
- Product catalog with variations and attributes
- Shopping cart and wishlist functionality
- Order processing
- Admin dashboard for managing:
  - Products
  - Categories & Sub-categories
  - Advertisements
  - Discount codes
  - Orders

## 🚀 Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB (with Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## 🔧 Project Structure (Monorepo)

- `/frontend`: Contains the React client-side application.
- `/backend`: Contains the Node.js/Express server-side application.

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or later)
- MongoDB

### Installation & Setup

**1. Backend:**
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your environment variables
# (MONGO_URI, JWT_SECRET, etc.)

# Start the server
npm run server


# Navigate to the frontend directory from the root
cd frontend

# Install dependencies
npm install

# Create a .env.local file and set your API base URL
# REACT_APP_API_BASE_URL=http://localhost:5000

# Start the client
npm start