const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;


    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "default_secret_key_change_in_production"
            );

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ success: false, message: "Not authorized. User no longer exists" });
            }

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: "Not authorized. Token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
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

const requireAssignedPoliceOrLawyer = async (req, res, next) => {
    try {
        if (!req.user || !["police", "lawyer"].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Only assigned police or lawyer can access this route" });
        }

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (req.user.role === "police") {
            if (!caseItem.assignedPolice || caseItem.assignedPolice.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "You are not the assigned police officer for this case" });
            }
        } else if (req.user.role === "lawyer") {
            if (!caseItem.assignedLawyer || caseItem.assignedLawyer.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "You are not the assigned lawyer for this case" });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error in authorization" });
    }
};

module.exports = { protect, authorizeRoles, requirePolice, requireAssignedPolice, requireAssignedPoliceOrLawyer };
