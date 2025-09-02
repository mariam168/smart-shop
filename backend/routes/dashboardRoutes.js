const express = require('express');
const router = express.Router();
const {
    getSummaryStats,
    getSalesOverTime,
    getTopSellingProducts,
    getRecentOrders,
    getCategoryDistribution
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect, admin);

router.get('/summary-stats', getSummaryStats);
router.get('/sales-over-time', getSalesOverTime);
router.get('/product-sales', getTopSellingProducts);
router.get('/recent-orders', getRecentOrders);
router.get('/category-distribution', getCategoryDistribution);

module.exports = router;