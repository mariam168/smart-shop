const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.user.id).select('-password');
            if (!req.user) { return res.status(401).json({ message: 'Not authorized, user not found for this token' }); }
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) { return res.status(401).json({ message: 'Not authorized, no token provided' }); }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { next(); }
    else { res.status(403).json({ message: 'Not authorized as an admin' }); }
};

module.exports = { protect, admin };