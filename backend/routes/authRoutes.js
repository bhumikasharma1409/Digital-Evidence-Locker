const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, updateLocality } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/users", protect, authorizeRoles("admin", "police"), getAllUsers);
router.put("/locality", protect, updateLocality);

module.exports = router;
