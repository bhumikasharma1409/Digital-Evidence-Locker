const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, getLawyers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/lawyers", protect, getLawyers);

module.exports = router;
