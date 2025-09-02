const express = require('express');
const router = express.Router();
const {
    getUsers,
    deleteUser,
    updateUserRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect, admin);

router.route('/')
    .get(getUsers);

router.route('/:id')
    .delete(deleteUser)
    .put(updateUserRole);

module.exports = router;