const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); 

const protect = async (req, res, next) => {
    let token;
    console.log('Auth Middleware: Entering protect function.'); 

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Auth Middleware: Token found:', token ? 'Exists' : 'Missing'); 
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Auth Middleware: Token decoded, user ID:', decoded.user.id); 
            
            req.user = await User.findById(decoded.user.id).select('-password');
            
            if (!req.user) { 
                console.log('Auth Middleware: User not found for token ID.'); 
                return res.status(401).json({ message: 'Not authorized, user not found for this token' }); 
            }
            console.log('Auth Middleware: User authenticated:', req.user.email); 
            next();
        } catch (error) {
            console.error('Auth Middleware: Token verification failed:', error.message); 
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) { 
        console.log('Auth Middleware: No token provided.'); 
        return res.status(401).json({ message: 'Not authorized, no token provided' }); 
    }
};

const admin = (req, res, next) => {
    console.log('Auth Middleware: Entering admin role check.'); 
    if (req.user && req.user.role === 'admin') { 
        console.log('Auth Middleware: User is admin.');
        next(); 
    } else { 
        console.log('Auth Middleware: User is NOT admin or req.user is missing.'); 
        res.status(403).json({ message: 'Not authorized as an admin' }); 
    }
};

module.exports = { protect, admin };