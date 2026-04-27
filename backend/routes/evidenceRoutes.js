const express = require("express");
const router = express.Router();
const multer = require("multer");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
    uploadEvidence,
    getEvidenceForCase,
    deleteEvidence,
    shareEvidence,
    verifyEvidence,
    rejectEvidence,
    lockEvidence,
    addRemarks,
    addLawyerNotes,
    requestAccess,
    approveAccessRequest,
    rejectAccessRequest,
    getCustodyLog,
    assignEvidence,
    downloadEvidence,
    getEvidenceByLocality
} = require("../controllers/evidenceController");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// UPLOAD EVIDENCE
router.post("/", protect, authorizeRoles("user", "admin", "police", "forensic"), upload.single("evidenceFile"), uploadEvidence);

// FETCH EVIDENCE FOR CASE
router.get("/case/:caseId", protect, getEvidenceForCase);

// FETCH EVIDENCE BY LOCALITY
router.get("/locality", protect, authorizeRoles("police", "lawyer", "admin"), getEvidenceByLocality);

// MODIFY EXISTING EVIDENCE (DELETE)
router.delete("/:id", protect, authorizeRoles("user", "admin"), deleteEvidence);

// SHARE EVIDENCE (USER -> POLICE/LAWYER)
router.put("/:id/share", protect, authorizeRoles("user", "admin", "police"), shareEvidence);

// POLICE/FORENSIC METADATA MUTATIONS
router.put("/:id/verify", protect, authorizeRoles("police", "forensic", "admin"), verifyEvidence);
router.put("/:id/reject", protect, authorizeRoles("police", "forensic", "admin"), rejectEvidence);
router.put("/:id/lock", protect, authorizeRoles("police", "forensic", "admin"), lockEvidence);
router.put("/:id/remark", protect, authorizeRoles("police", "forensic", "admin"), addRemarks);
router.put("/:id/assign", protect, authorizeRoles("police", "forensic", "admin"), assignEvidence);

// LAWYER MUTATIONS
router.put("/:id/note", protect, authorizeRoles("lawyer"), addLawyerNotes);
router.post("/:id/request-access", protect, authorizeRoles("lawyer"), requestAccess); // Changed from PUT to POST to match nested creation logic conventionally

// ACCESS REQUEST ADMINISTRATIONS
router.put("/:id/access-requests/:requestId/approve", protect, authorizeRoles("admin", "police", "user"), approveAccessRequest);
router.put("/:id/access-requests/:requestId/reject", protect, authorizeRoles("admin", "police", "user"), rejectAccessRequest);

// CUSTODY FETCHER
router.get("/:id/custody", protect, getCustodyLog);

// SECURE DOWNLOAD
router.get("/:id/download", protect, downloadEvidence);

module.exports = router;
