const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify the token — this throws an error if invalid or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user and attach to request object (minus password)
        req.user = await User.findById(decoded.id).select('-password');

        next(); // token is valid — let the request continue
    } catch (err) {
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

module.exports = protect;