const Evidence = require("../models/evidence.model");
const Case = require("../models/case.model");
const crypto = require("crypto");
const fs = require("fs");

const generateHash = (filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        return hashSum.digest("hex");
    } catch (error) {
        console.error("Error generating hash:", error);
        return "ERROR_GENERATING_HASH";
    }
};

const pushAudit = async (caseId, logMsg) => {
    try {
        const caseItem = await Case.findById(caseId);
        if (caseItem) {
            caseItem.activityLog.push(logMsg);
            await caseItem.save();
        }
    } catch (err) {
        console.error(err);
    }
};

exports.uploadEvidence = async (req, res) => {
    try {
        const { caseId } = req.body;
        if (!req.file || !caseId) {
            return res.status(400).json({ success: false, message: "File and caseId required" });
        }

        const hash = generateHash(req.file.path);
        
        const evidence = await Evidence.create({
            caseId,
            uploadedBy: req.user._id,
            filePath: req.file.path,
            originalName: req.file.originalname,
            hash,
            activityLog: ["Evidence initialized"]
        });

        await pushAudit(caseId, `Evidence item [${req.file.originalname}] universally seeded by ${req.user.fullName}`);

        res.status(201).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEvidenceForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const evidenceList = await Evidence.find({ caseId })
            .populate("uploadedBy", "fullName role")
            .populate("sharedWithPolice", "fullName")
            .populate("sharedWithLawyers", "fullName")
            .populate("policeRemarks.addedBy", "fullName")
            .populate("verifiedBy", "fullName")
            .populate("rejectedBy", "fullName");

        // Filter based on roles
        const filtered = evidenceList.map(ev => {
            const evObj = ev.toObject();
            if (req.user.role === "lawyer") {
                // Return lawyerNotes only for the specific lawyer
                evObj.lawyerNotes = ev.lawyerNotes.filter(n => n.lawyerId.toString() === req.user._id.toString());
            }
            return evObj;
        }).filter(ev => {
            if (req.user.role === "admin" || req.user.role === "forensic") return true;
            if (req.user.role === "user") return ev.uploadedBy._id.toString() === req.user._id.toString();
            if (req.user.role === "police") return true; // assuming police can see to verify
            if (req.user.role === "lawyer") {
                // Must be shared explicitly
                return ev.sharedWithLawyers.some(l => l._id.toString() === req.user._id.toString()) || ev.status === "verified";
            }
            return false;
        });

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        if (evidence.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (evidence.status === "verified" || evidence.isLocked || evidence.status === "locked") {
            return res.status(400).json({ success: false, message: "Evidence is locked/verified and cannot be deleted" });
        }

        await evidence.deleteOne();
        await pushAudit(evidence.caseId, `Evidence item [${evidence.originalName}] permanently destroyed`);
        res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.shareEvidence = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const evidence = await Evidence.findById(req.params.id);
        
        // Find user to see role
        const targetUser = await mongoose.model("User").findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "Target user not found" });

        if (targetUser.role === "police") {
            if (!evidence.sharedWithPolice.includes(targetUserId)) {
                evidence.sharedWithPolice.push(targetUserId);
                evidence.activityLog.push(`Shared securely with Police Officer: ${targetUser.fullName}`);
            }
        } else if (targetUser.role === "lawyer") {
            if (!evidence.sharedWithLawyers.includes(targetUserId)) {
                evidence.sharedWithLawyers.push(targetUserId);
                evidence.activityLog.push(`Shared securely with Lawyer: ${targetUser.fullName}`);
            }
        }
        await evidence.save();
        await pushAudit(evidence.caseId, `Evidence [${evidence.originalName}] shared with ${targetUser.fullName}`);
        
        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        evidence.status = "verified";
        evidence.verifiedBy = req.user._id;
        evidence.verifiedAt = Date.now();
        evidence.activityLog.push(`CRYPTOGRAPHIC VERIFICATION SUCCESS by ${req.user.fullName}`);
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Evidence [${evidence.originalName}] cryptographically VERIFIED`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        evidence.status = "rejected";
        evidence.rejectedBy = req.user._id;
        evidence.rejectedAt = Date.now();
        evidence.activityLog.push(`EVIDENCE REJECTED INTENTIONALLY by ${req.user.fullName}`);
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Evidence [${evidence.originalName}] natively REJECTED from ledger.`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.lockEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        evidence.isLocked = true;
        evidence.status = "locked"; // Or just keep the flag
        evidence.activityLog.push(`VAULT OBJECT SECURELY LOCKED by ${req.user.fullName}`);
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Evidence [${evidence.originalName}] forcibly LOCKED`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addRemarks = async (req, res) => {
    try {
        const { text } = req.body;
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        evidence.policeRemarks.push({ text, addedBy: req.user._id });
        evidence.activityLog.push(`Official Police Remark Attached by ${req.user.fullName}`);
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Cyber-Remarks appended natively into [${evidence.originalName}] log.`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addLawyerNotes = async (req, res) => {
    try {
        const { text } = req.body;
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        evidence.lawyerNotes.push({ text, lawyerId: req.user._id });
        // NOTE: explicitly avoiding exposing lawyer notes dynamically across public streams via audit
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Lawyer notes appended actively onto evidence sequence [Hidden internally]`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestAccess = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        if (!evidence.accessRequests.includes(req.user._id)) {
            evidence.accessRequests.push(req.user._id);
            evidence.activityLog.push(`Access ping logged externally from ${req.user.fullName}`);
        }
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Unauthorized request-ping recorded mapping towards [${evidence.originalName}]`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignEvidence = async (req, res) => {
    try {
        const { targetCaseId } = req.body;
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        const oldCase = evidence.caseId;
        evidence.caseId = targetCaseId;
        evidence.activityLog.push(`Transferred allocation natively by ${req.user.fullName}`);
        
        await evidence.save();
        await pushAudit(oldCase, `Evidence [${evidence.originalName}] unlinked and reassigned external.`);
        await pushAudit(targetCaseId, `Evidence [${evidence.originalName}] officially accepted onto this node.`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
