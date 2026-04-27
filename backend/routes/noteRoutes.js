const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getNotesForEvidence, addNote, updateNote, deleteNote } = require("../controllers/noteController");

router.get("/:evidenceId", protect, getNotesForEvidence);
router.post("/:evidenceId", protect, addNote);
router.put("/:noteId", protect, updateNote);
router.delete("/:noteId", protect, deleteNote);

module.exports = router;
