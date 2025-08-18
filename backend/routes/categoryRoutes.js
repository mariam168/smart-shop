const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const createUploadMiddleware = require('../middlewares/uploadMiddleware');
const upload = createUploadMiddleware('categories');
const categoryUploadMiddleware = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subCategoryImages', maxCount: 50 }
]);

router.route('/')
    .get(getCategories)
    .post(protect, admin, categoryUploadMiddleware, createCategory);

router.route('/:id')
    .get(getCategoryById)
    .put(protect, admin, categoryUploadMiddleware, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;