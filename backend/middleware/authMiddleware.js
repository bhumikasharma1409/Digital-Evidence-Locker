const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "default_secret_key_change_in_production"
            );

            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");

            // Verify user actually exists in case token is old but valid
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Not authorized. User no longer exists" });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: "Not authorized. Token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

module.exports = { protect };
