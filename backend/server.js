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

const app = express();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully.');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
connectDB(); 

// --- (التعديل الحاسم هنا) ---
// For now, let's allow all origins to make sure everything else is working.
app.use(cors({
    origin: '*', // Allow all origins
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-request', 'accept-language']
}));
// --- نهاية التعديل ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.get('/', (req, res) => {
    res.send('API Root is running...');
});

app.get('/api', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;