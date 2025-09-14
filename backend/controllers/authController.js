const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role) => {
    return jwt.sign({ user: { id, role } }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ errors: [{ msg: 'User already exists with this email' }] });

        user = new User({ name, email, password, role: role || 'user' });
        await user.save();
        
        /*
        const activationToken = user.getActivationToken();
        await user.save();

        const activationUrl = `${process.env.CLIENT_URL}/activate/${activationToken}`;
        const message = `<h1>Email Account Activation</h1><p>Please click on the following link to activate your account:</p><a href="${activationUrl}" clicktracking="off">${activationUrl}</a><p>This link will expire in 24 hours.</p>`;

        await sendEmail({ email: user.email, subject: `Account Activation for ${process.env.FROM_NAME}`, message });

        res.status(201).json({ success: true, message: 'Registration successful! Please check your email for activation link.' });
        */
        
        res.status(201).json({
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated }
        });

    } catch (err) {
        next(err);
    }
};

const activateAccount = async (req, res, next) => {
    return res.status(404).json({ message: 'Feature not available.' });
    /*
    const activationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({ activationToken, activationTokenExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired activation token.' });

        user.isActivated = true;
        user.activationToken = undefined;
        user.activationTokenExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Account activated successfully!' });
    } catch (err) {
        next(err);
    }
    */
};

const loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        /*
        if (!user.isActivated) {
            return res.status(401).json({ errors: [{ msg: 'Account not activated. Please check your email.' }] });
        }
        */
        res.json({
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, isActivated: user.isActivated }
        });
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    return res.status(404).json({ message: 'Feature not available.' });
    /*
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({ success: true, message: 'If a user exists, an email has been sent.' });

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;
        const message = `<h1>Password Reset Request</h1><p>Please click the link to reset your password:</p><a href="${resetUrl}" clicktracking="off">${resetUrl}</a><p>This link will expire in 10 minutes.</p>`;

        await sendEmail({ email: user.email, subject: `Password Reset for ${process.env.FROM_NAME}`, message });
        res.status(200).json({ success: true, message: 'Password reset email sent.' });
    } catch (err) {
        console.error("Forgot password email error:", err);
        next(err);
    }
    */
};

const validateResetToken = async (req, res, next) => {
    return res.status(404).json({ message: 'Feature not available.' });
    /*
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });
        res.status(200).json({ success: true, message: 'Token is valid.' });
    } catch (err) {
        next(err);
    }
    */
};

const resetPassword = async (req, res, next) => {
    return res.status(404).json({ message: 'Feature not available.' });
    /*
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (err) {
        next(err);
    }
    */
};

const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            const updatedUser = await user.save();
            res.json({
                user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, isActivated: updatedUser.isActivated }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

const updateUserPassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Please provide valid current and new passwords (min 6 chars).' });
    }

    try {
        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Invalid current password' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    activateAccount,
    loginUser,
    forgotPassword,
    validateResetToken,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
};