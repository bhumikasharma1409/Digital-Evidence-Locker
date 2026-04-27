const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Case = require("../models/case.model");

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

const requirePolice = (req, res, next) => {
    if (req.user && req.user.role === 'police') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Not authorized. Police access required." });
    }
};

const requireAssignedPolice = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'police') {
            return res.status(403).json({ success: false, message: "Not authorized. Police access required." });
        }

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseItem.assignedPolice || caseItem.assignedPolice.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized. You are not assigned to this case." });
        }

        req.caseItem = caseItem;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error verifying police assignment" });
    }
};

module.exports = { protect, requirePolice, requireAssignedPolice };
