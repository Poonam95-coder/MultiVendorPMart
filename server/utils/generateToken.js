const jwt = require("jsonwebtoken");

// Generate JWT token for authentication
function generateToken(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || "7d"
        }
    );
}

module.exports = generateToken;