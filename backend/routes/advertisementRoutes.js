const express = require('express');
const router = express.Router();
const { getAdvertisements, getAdvertisementRaw, createAdvertisement, updateAdvertisement, deleteAdvertisement } = require('../controllers/advertisementController');
const { protect, admin } = require('../middlewares/authMiddleware');
const createUploadMiddleware = require('../middlewares/uploadMiddleware');
const upload = createUploadMiddleware('advertisements');

router.route('/')
    .get(getAdvertisements)
    .post(protect, admin, upload.single('image'), createAdvertisement);

router.route('/:id')
    .put(protect, admin, upload.single('image'), updateAdvertisement)
    .delete(protect, admin, deleteAdvertisement);

router.get('/:id/raw', protect, admin, getAdvertisementRaw);

module.exports = router;