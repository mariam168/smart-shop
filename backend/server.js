const app = require('./app');
const connectDB = require('./config/db');
connectDB();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
// });
// الكود الجديد
// The app is exported for Vercel to use
module.exports = app;