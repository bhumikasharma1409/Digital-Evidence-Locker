const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, authorizeRoles, requirePolice, requireAssignedPolice, requireAssignedPoliceOrLawyer } = require("../middleware/authMiddleware");




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

const { createCase, getCases, getCaseById, getUserCases, uploadEvidence, deleteCase, updateCase, verifyEvidence, assignPolice, updateStatus, addNote, verifyCase } = require("../controllers/caseController");


router.post("/upload-evidence", protect, authorizeRoles("user", "admin"), upload.single("evidenceFile"), uploadEvidence);


router.post("/", protect, authorizeRoles("user", "admin"), upload.single("evidenceFile"), createCase);


router.get("/", protect, authorizeRoles("user", "lawyer", "police", "admin"), getCases);


// SSR Report Route
const { renderReport } = require("../controllers/caseController");
router.get("/report/:id", renderReport);

router
    .route("/:id")
    .get(protect, authorizeRoles("user", "lawyer", "police", "forensic", "admin"), getCaseById)
    .put(protect, authorizeRoles("user", "lawyer", "police", "forensic", "admin"), upload.single("evidenceFile"), updateCase)
    .delete(protect, authorizeRoles("user", "admin"), deleteCase);

router.get("/:id/verify-evidence", protect, authorizeRoles("police", "forensic", "admin"), verifyEvidence);

router.patch("/:id/assign-police", protect, requirePolice, assignPolice);

router.patch("/:id/status", protect, requireAssignedPolice, updateStatus);

router.post("/:id/notes", protect, requireAssignedPoliceOrLawyer, addNote);

router.patch("/:id/verify", protect, requireAssignedPolice, verifyCase);


router.get("/user/:userId", protect, getUserCases);

router.get("/user/:userId", protect, getUserCases);

module.exports = router;