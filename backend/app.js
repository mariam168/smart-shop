require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Middlewares & Routes
const languageMiddleware = require('./middlewares/languageMiddleware');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Security & Body Parser Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// الكود الجديد
app.use(mongoSanitize({
    replaceWith: '_',
}));
app.use(xss());
app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api', languageMiddleware);

// API Routes
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

// Root route for Vercel health check
app.get('/', (req, res) => {
    res.send('Smart Shop Backend API is running!');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Vercel handles the listening part, so we only export the app
module.exports = app;