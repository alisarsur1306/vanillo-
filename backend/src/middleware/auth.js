const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'User account is deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};

exports.adminAuth = async (req, res, next) => {
    try {
        await exports.auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Middleware to check user role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

module.exports = {
    auth,
    adminAuth,
    checkRole
}; 