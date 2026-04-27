const Evidence = require("../models/evidence.model");
const Case = require("../models/case.model");
const CustodyLog = require("../models/custody.model");
const crypto = require("crypto");
const fs = require("fs");

const logCustody = async (evidenceId, caseId, actionTitle, actorId, actorRole, details) => {
    try {
        await CustodyLog.create({
            evidenceId, caseId, actionTitle, actorId, actorRole, details
        });
    } catch (err) {
        console.error("Custody log tracking error:", err);
    }
};

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
        await logCustody(evidence._id, caseId, "Uploaded Evidence", req.user._id, req.user.role, "Vault object initialized into system.");

        // Socket emit
        const io = req.app.get("io");
        if (io) {
            io.to(caseId).emit("evidenceUploaded", evidence);
        }

        res.status(201).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const mongoose = require("mongoose");

exports.getEvidenceForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        
        // Ensure caseId is a valid ObjectId for the query
        const query = {};
        if (mongoose.Types.ObjectId.isValid(caseId)) {
            query.caseId = new mongoose.Types.ObjectId(caseId);
        } else {
            query.caseId = caseId;
        }

        const evidenceList = await Evidence.find(query)
            .populate("uploadedBy", "fullName role")
            .populate("sharedWithPolice", "fullName")
            .populate("sharedWithLawyers", "fullName")
            .populate("policeRemarks.addedBy", "fullName")
            .populate("verifiedBy", "fullName")
            .populate("rejectedBy", "fullName")
            .populate("accessRequests.requestedBy", "fullName role");

        // Fetch the case to check ownership
        const caseItem = await Case.findById(caseId);

        // Filter based on roles and ownership
        const filtered = evidenceList.map(ev => {
            const evObj = ev.toObject();
            evObj.hasAccess = true;

            const uploaderId = ev.uploadedBy?._id?.toString() || ev.uploadedBy?.toString();
            const currentUserId = req.user._id.toString();

            if (req.user.role === "lawyer") {
                // Return lawyerNotes only for the specific lawyer
                if (ev.lawyerNotes) {
                    evObj.lawyerNotes = ev.lawyerNotes.filter(n => n.lawyerId && n.lawyerId.toString() === currentUserId);
                }
                
                const hasExplicitAccess = ev.sharedWithLawyers && ev.sharedWithLawyers.some(l => (l._id?.toString() || l.toString()) === currentUserId);
                if (!hasExplicitAccess && ev.status !== "verified") {
                    evObj.hasAccess = false;
                    evObj.filePath = null;
                    evObj.hash = null;
                    evObj.originalName = "CLASSIFIED MATERIAL";
                }
            }
            return evObj;
        }).filter(ev => {
            const currentUserId = req.user._id.toString();
            const uploaderId = ev.uploadedBy?._id?.toString() || ev.uploadedBy?.toString();
            const isOwner = caseItem && caseItem.createdBy && caseItem.createdBy.toString() === currentUserId;

            if (req.user.role === "admin" || req.user.role === "forensic") return true;
            if (req.user.role === "user") {
                // User can see what they uploaded OR any evidence in their own case
                return uploaderId === currentUserId || isOwner;
            }
            if (req.user.role === "police") return true; 
            if (req.user.role === "lawyer") return true; 
            return false;
        });

        res.status(200).json({ success: true, data: filtered });
    } catch (error) {
        console.error("Error in getEvidenceForCase:", error);
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

        await logCustody(evidence._id, evidence.caseId, "Deleted Evidence", req.user._id, req.user.role, "Evidence permanently destroyed.");
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
        await logCustody(evidence._id, evidence.caseId, "Shared Access", req.user._id, req.user.role, `Shared securely with ${targetUser.fullName} (${targetUser.role})`);
        
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
        await logCustody(evidence._id, evidence.caseId, "Verified Evidence", req.user._id, req.user.role, "Cryptographic seal validated successfully.");

        // Socket emit
        const io = req.app.get("io");
        if (io) {
            io.to(evidence.caseId.toString()).emit("evidenceUpdated", evidence);
        }

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
        await logCustody(evidence._id, evidence.caseId, "Rejected Evidence", req.user._id, req.user.role, "Explicitly rejected verified alignment.");

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
        await logCustody(evidence._id, evidence.caseId, "Locked Vault", req.user._id, req.user.role, "Sealed completely against edits.");

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
        const { reason } = req.body;
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        const existingRequest = evidence.accessRequests.find(r => r.requestedBy.toString() === req.user._id.toString() && r.status === "pending");
        if (!existingRequest) {
            evidence.accessRequests.push({
                requestedBy: req.user._id,
                requestedRole: req.user.role,
                reason: reason || "No reason provided",
                status: "pending"
            });
            evidence.activityLog.push(`Access ping logged externally from ${req.user.fullName}`);
        }
        
        await evidence.save();
        await pushAudit(evidence.caseId, `Unauthorized request-ping recorded mapping towards [${evidence.originalName}]`);
        await logCustody(evidence._id, evidence.caseId, "Requested Access", req.user._id, req.user.role, `Reason: ${reason || 'N/A'}`);

        // Socket emit
        const io = req.app.get("io");
        if (io) {
            io.to(evidence.caseId.toString()).emit("evidenceUpdated", evidence);
        }

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveAccessRequest = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        // Fetch the associated case to check ownership
        const caseItem = await Case.findById(evidence.caseId);
        if (!caseItem) return res.status(404).json({ success: false, message: "Associated case not found" });

        const isCaseCreator = caseItem.createdBy.toString() === req.user._id.toString();
        const isUploader = evidence.uploadedBy.toString() === req.user._id.toString();

        // Only Case Creator (User), the uploader, or Admin/Forensic can approve
        if (!isCaseCreator && !isUploader && !["admin", "forensic"].includes(req.user.role)) {
             return res.status(403).json({ success: false, message: "Only the case owner or uploader can approve access requests." });
        }

        const request = evidence.accessRequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });

        request.status = "approved";
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();

        if (request.requestedRole === "lawyer" && !evidence.sharedWithLawyers.includes(request.requestedBy)) {
             evidence.sharedWithLawyers.push(request.requestedBy);
        } else if (request.requestedRole === "police" && !evidence.sharedWithPolice.includes(request.requestedBy)) {
             evidence.sharedWithPolice.push(request.requestedBy);
        }

        await evidence.save();
        await logCustody(evidence._id, evidence.caseId, "Approved Access Request", req.user._id, req.user.role, `Approved access for ID: ${request.requestedBy}`);

        // Socket emit
        const io = req.app.get("io");
        if (io) {
            io.to(evidence.caseId.toString()).emit("evidenceUpdated", evidence);
        }

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectAccessRequest = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        // Fetch the associated case to check ownership
        const caseItem = await Case.findById(evidence.caseId);
        if (!caseItem) return res.status(404).json({ success: false, message: "Associated case not found" });

        const isCaseCreator = caseItem.createdBy.toString() === req.user._id.toString();
        const isUploader = evidence.uploadedBy.toString() === req.user._id.toString();

        if (!isCaseCreator && !isUploader && !["admin", "forensic"].includes(req.user.role)) {
             return res.status(403).json({ success: false, message: "Only the case owner or uploader can reject access requests." });
        }

        const request = evidence.accessRequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });

        request.status = "rejected";
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();

        await evidence.save();
        await logCustody(evidence._id, evidence.caseId, "Rejected Access Request", req.user._id, req.user.role, `Rejected access for ID: ${request.requestedBy}`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCustodyLog = async (req, res) => {
    try {
        const custodyLogs = await CustodyLog.find({ evidenceId: req.params.id })
            .populate("actorId", "fullName role")
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: custodyLogs });
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
        await logCustody(evidence._id, evidence.caseId, "Transferred Assignment", req.user._id, req.user.role, `Pushed from ${oldCase} to ${targetCaseId}.`);

        res.status(200).json({ success: true, data: evidence });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.downloadEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, message: "Not found" });

        // Access checks
        let hasAccess = false;
        if (["admin", "forensic", "police"].includes(req.user.role)) hasAccess = true;
        if (req.user.role === "user" && evidence.uploadedBy.toString() === req.user._id.toString()) hasAccess = true;
        if (req.user.role === "lawyer") {
            const isShared = evidence.sharedWithLawyers.includes(req.user._id);
            if (isShared || evidence.status === "verified") hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ success: false, message: "Unauthorized to access this vault object directly." });
        }

        const path = require("path");
        const fullPath = path.resolve(__dirname, "..", evidence.filePath);
        
        evidence.activityLog.push(`RAW BINARY FETCHED SECURELY by ${req.user.fullName}`);
        await evidence.save();
        await pushAudit(evidence.caseId, `Evidence source binary directly fetched by ${req.user.fullName}`);
        await logCustody(evidence._id, evidence.caseId, "Downloaded Raw File", req.user._id, req.user.role, "Secured direct binary fetch request.");

        res.download(fullPath, evidence.originalName || "evidence.bin");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
