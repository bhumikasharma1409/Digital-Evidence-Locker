const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");


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

        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only image, video, and PDF files are allowed!"), false);
        }
    }
});

const { createCase, getCases, getCaseById, getUserCases, uploadEvidence, deleteCase } = require("../controllers/caseController");


router.post("/upload-evidence", protect, upload.single("evidenceFile"), uploadEvidence);


router.post("/", protect, upload.single("evidenceFile"), createCase);


router.get("/", protect, getCases);


router
    .route("/:id")
    .get(protect, getCaseById)
    .delete(protect, deleteCase);


router.get("/user/:userId", protect, getUserCases);

module.exports = router;