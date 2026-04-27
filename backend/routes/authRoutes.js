const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, updateUserProfile, getLawyers } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/update-profile", protect, updateUserProfile);
router.get("/lawyers", protect, getLawyers);
router.get("/users", protect, authorizeRoles("admin", "police"), getAllUsers);

module.exports = router;
