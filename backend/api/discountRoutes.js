const express = require('express');
const router = express.Router();
const {
    validateDiscount,
    getActiveDiscounts,
    getAllDiscounts,
    getDiscountById,
    createDiscount,
    updateDiscount,
    deleteDiscount,
} = require('../controllers/discountController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/validate', protect, validateDiscount);
router.get('/active', getActiveDiscounts);

router.route('/')
    .get(protect, admin, getAllDiscounts)
    .post(protect, admin, createDiscount);

router.route('/:id')
    .get(protect, admin, getDiscountById)
    .put(protect, admin, updateDiscount)
    .delete(protect, admin, deleteDiscount);

module.exports = router;