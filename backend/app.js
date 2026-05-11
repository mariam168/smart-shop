require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const languageMiddleware = require('./middlewares/languageMiddleware');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const discountRoutes = require('./routes/discountRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

/* =========================
   DB CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

/* =========================
   CORS FIX (IMPORTANT 🔥)
========================= */

const allowedOrigins = [
  "https://smart-shop-khaki.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Preflight support
app.options("*", cors());

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize({ replaceWith: '_' }));
app.use(xss());
app.use(compression());

/* =========================
   RATE LIMIT
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

/* =========================
   CUSTOM MIDDLEWARE
========================= */
app.use('/api', languageMiddleware);

/* =========================
   ROUTES
========================= */
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get('/', (req, res) => {
  res.send('🚀 Smart Shop Backend API is running!');
});

/* =========================
   ERROR HANDLING
========================= */
app.use(notFound);
app.use(errorHandler);

/* =========================
   IMPORTANT FOR VERCEL
   ❌ DO NOT USE app.listen()
========================= */

module.exports = app;









// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');

// const languageMiddleware = require('./middlewares/languageMiddleware');
// const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
// const productRoutes = require('./routes/productRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const advertisementRoutes = require('./routes/advertisementRoutes');
// const discountRoutes = require('./routes/discountRoutes');
// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes'); 
// const wishlistRoutes = require('./routes/wishlistRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const contactRoutes = require('./routes/contactRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');

// const app = express();

// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('✅ MongoDB connected successfully.'))
//     .catch((error) => {
//         console.error('❌ MongoDB connection error:', error.message);
//         process.exit(1); 
//     });

// app.use(cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
// }));

// app.use(helmet());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(mongoSanitize({
//     replaceWith: '_',
// }));
// app.use(xss());
// app.use(compression());

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 200,
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use('/api', limiter);

// app.use('/api', languageMiddleware);

// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/advertisements', advertisementRoutes);
// app.use('/api/discounts', discountRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); 
// app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/contact', contactRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// app.get('/', (req, res) => {
//     res.send('Smart Shop Backend API is running!');
// });

// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });