const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerUser, activateAccount, loginUser, forgotPassword, validateResetToken, resetPassword, updateUserProfile, updateUserPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
], registerUser);

// router.get('/activate/:token', activateAccount);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], loginUser);

// router.post('/forgotpassword', forgotPassword);
// router.get('/validate-reset-token/:token', validateResetToken);
// router.put('/resetpassword/:token', resetPassword);

router.put('/profile', protect, updateUserProfile);
router.put('/profile/password', protect, updateUserPassword);

module.exports = router;