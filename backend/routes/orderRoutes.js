const express = require('express');
const router = express.Router();
const {
    getAdminOrderList, 
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    deleteOrder,
    updateOrder, 
} = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/admin-list', protect, admin, getAdminOrderList);

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getAllOrders); 

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrder) 
    .delete(protect, admin, deleteOrder);

router.put('/:id/pay', protect, admin, updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

module.exports = router;