const Note = require("../models/note.model");
const Evidence = require("../models/evidence.model");
const CustodyLog = require("../models/custody.model");

const addCustodyLog = async (evidenceId, caseId, actionTitle, actorId, actorRole, details) => {
    try {
        await CustodyLog.create({
            evidenceId,
            caseId,
            actionTitle,
            actorId,
            actorRole,
            details
        });
    } catch (err) {
        console.error("Custody track err:", err);
    }
};

exports.getNotesForEvidence = async (req, res) => {
    try {
        const { evidenceId } = req.params;
        const notes = await Note.find({ evidenceId }).populate("createdBy", "fullName role").sort("createdAt");
        
        const filtered = notes.filter(n => {
            if (req.user.role === "lawyer") {
                return n.noteType !== "police" && n.noteType !== "internal" || (n.noteType === "lawyer" && n.createdBy._id.toString() === req.user._id.toString());
            }
            if (n.noteType === "lawyer") {
                if (req.user.role === "admin") return true;
                return n.createdBy._id.toString() === req.user._id.toString();
            }
            return true;
        });

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addNote = async (req, res) => {
    try {
        const { evidenceId } = req.params;
        const { text, noteType, isPrivate } = req.body;
        const evidence = await Evidence.findById(evidenceId);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        const note = await Note.create({
            evidenceId,
            caseId: evidence.caseId,
            createdBy: req.user._id,
            creatorRole: req.user.role,
            noteType: noteType || "internal",
            text,
            isPrivate: isPrivate || false
        });

        await addCustodyLog(evidenceId, evidence.caseId, `Added ${noteType.toUpperCase()} note`, req.user._id, req.user.role, "Appended discussion thread node.");

        res.status(201).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) return res.status(404).json({ success: false, message: "Not found" });

        if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        
        // Police notes cannot be edited by lawyers
        if (note.noteType === "police" && req.user.role === "lawyer") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        note.text = req.body.text;
        await note.save();

        await addCustodyLog(note.evidenceId, note.caseId, `Modified ${note.noteType.toUpperCase()} note`, req.user._id, req.user.role, "Thread context edited.");

        res.status(200).json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) return res.status(404).json({ success: false, message: "Not found" });

        if (note.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await note.deleteOne();

        await addCustodyLog(note.evidenceId, note.caseId, `Deleted ${note.noteType.toUpperCase()} note`, req.user._id, req.user.role, "Thread sequence sanitized.");

        res.status(200).json({ success: true, message: "Note deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
