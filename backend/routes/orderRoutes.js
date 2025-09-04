const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getAllOrders);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById);

router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

module.exports = router;