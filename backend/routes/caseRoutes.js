const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");

// Setup multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept images, videos, pdfs
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only image, video, and PDF files are allowed!"), false);
        }
    }
});

const { createCase, getCases, getCaseById, getUserCases, uploadEvidence, deleteCase } = require("../controllers/caseController");

// Upload Evidence API
router.post("/upload-evidence", protect, upload.single("evidenceFile"), uploadEvidence);

// Create new case (Optionally handling file upload at creation as well if needed, but per requirements we have upload-evidence. 
// We will still allow handling 'evidenceFile' for create case if they send it via form data in one go)
router.post("/", protect, upload.single("evidenceFile"), createCase);

// GET all cases
router.get("/", protect, getCases);

// GET a single case by ID, and DELETE case by ID
router
    .route("/:id")
    .get(protect, getCaseById)
    .delete(protect, deleteCase);

// GET cases by User ID
router.get("/user/:userId", protect, getUserCases);

module.exports = router;