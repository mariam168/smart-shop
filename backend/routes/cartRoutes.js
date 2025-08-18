const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart)
    .put(protect, updateCartItem);

router.delete('/clear', protect, clearCart);

module.exports = router;