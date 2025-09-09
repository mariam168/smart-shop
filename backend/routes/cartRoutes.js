const express = require('express');
const router = express.Router();
const { getCart, syncCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getCart);
    
router.post('/sync', protect, syncCart);

router.delete('/clear', protect, clearCart);

module.exports = router;