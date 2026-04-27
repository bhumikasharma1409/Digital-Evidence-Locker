const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            token = req.headers.authorization.split(" ")[1];


            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "default_secret_key_change_in_production"
            );


            req.user = await User.findById(decoded.id).select("-password");


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

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`,
            });
        }
        next();
    };
};

const Case = require("../models/case.model");

const requirePolice = authorizeRoles("police");

const requireAssignedPolice = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "police") {
            return res.status(403).json({ success: false, message: "Only police can access this route" });
        }

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseItem.assignedPolice || caseItem.assignedPolice.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not the assigned police officer for this case" });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error in authorization" });
    }
};

module.exports = { protect, authorizeRoles, requirePolice, requireAssignedPolice };
