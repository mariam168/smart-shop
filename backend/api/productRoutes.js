const express = require('express');
const router = express.Router();
const {
    getAdminProductList,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');
const createUploadMiddleware = require('../middlewares/uploadMiddleware');
const upload = createUploadMiddleware('products');
router.get('/admin-list', protect, admin, getAdminProductList);

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.any(), createProduct); 
router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.any(), updateProduct)
    .delete(protect, admin, deleteProduct);

router.post('/:id/reviews', protect, createProductReview);

module.exports = router;