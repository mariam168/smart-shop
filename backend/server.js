require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Middlewares
const languageMiddleware = require('./middlewares/languageMiddleware');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Import Routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// --- (1) Initialize Express App ---
const app = express();

// --- (2) Connect to Database ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully.');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};
connectDB(); 

// --- (3) Middlewares Setup ---

// --- (التعديل الحاسم لحل مشكلة CORS) ---
const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean); // filter(Boolean) removes any undefined/null values if CLIENT_URL is not set

// Vercel adds a trailing slash to the origin header, so we add it to our list if it exists
if (process.env.CLIENT_URL) {
    allowedOrigins.push(`${process.env.CLIENT_URL}/`);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-request', 'accept-language']
}));
// --- نهاية تعديل CORS ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- (4) API Routes ---
app.use('/api', languageMiddleware);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('API Root is running...');
});

app.get('/api', (req, res) => {
    res.send('API is running...');
});


// --- (5) Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- (6) Export for Vercel ---
module.exports = app;