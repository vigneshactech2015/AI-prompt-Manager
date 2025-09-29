const {verifyToken} = require('../utils/jwtUtils')

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            data: { message: "Access token is required" }
        });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        return res.status(403).json({
            data: { message: "Invalid or expired token" }
        });
    }
};

module.exports = {authenticateToken}