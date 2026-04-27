const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/user", protect, authorizeRoles("user", "admin"), dashboardController.getUserDashboard);
router.get("/police", protect, authorizeRoles("police", "admin"), dashboardController.getPoliceDashboard);
router.get("/lawyer", protect, authorizeRoles("lawyer", "admin"), dashboardController.getLawyerDashboard);
router.get("/admin", protect, authorizeRoles("admin"), dashboardController.getAdminDashboard);

module.exports = router;
