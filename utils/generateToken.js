const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },                          // payload — what we store inside the token
        process.env.JWT_SECRET,                  // secret key — used to sign it
        { expiresIn: '7d' }                      // token expires in 7 days
    );
};

module.exports = generateToken;