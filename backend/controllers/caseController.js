const Case = require("../models/case.model");
const crypto = require("crypto");
const fs = require("fs");

const generateHash = (filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        return hashSum.digest("hex");
    } catch (e) {
        console.error("Error generating hash:", e);
        return null;
    }
};
exports.createCase = async (req, res) => {
  try {
    const { title, category, description, assignedLawyer } = req.body;

    if (!title || !category || !description || !assignedLawyer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including an assigned lawyer",
      });
    }

    const { locality, district, state } = req.user;
    if (!locality || !district || !state) {
      return res.status(400).json({ success: false, message: "Please update your profile with locality, district, and state before creating cases." });
    }

    const lawyer = await require("../models/User").findById(assignedLawyer);
    if (!lawyer || lawyer.role !== 'lawyer') {
        return res.status(400).json({ success: false, message: "Invalid lawyer assigned" });
    }

    let evidenceFile = null;
    let fileHash = null;
    let logEntries = ["Case Created"];

    if (req.file) {
      evidenceFile = req.file.path;
      fileHash = generateHash(evidenceFile);
      logEntries.push("Evidence Uploaded on Creation");
    }

    const newCase = new Case({
      title,
      category,
      description,
      hash: fileHash,
      evidenceFile,
      activityLog: logEntries,
      createdBy: req.user._id,
      assignedLawyer,
      locality,
      district,
      state
    });

    const savedCase = await newCase.save();

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: savedCase,
    });

  } catch (error) {
    console.error("Error creating case:", error);

    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};


exports.updateCase = async (req, res) => {
  try {
    const { title, category, description, status, assignedPolice, assignedLawyer } = req.body;
    let caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const isCreator = caseItem.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isPolice = req.user.role === "police";

    if (isCreator && req.user.role === "user") {
        return res.status(403).json({ success: false, message: "Users cannot modify cases after submission." });
    }

    if (isPolice && (!caseItem.assignedPolice || caseItem.assignedPolice.toString() !== req.user._id.toString())) {
        return res.status(403).json({ success: false, message: "You must take ownership of this case before editing it." });
    }

    if (!isCreator && !isAdmin && !isPolice) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this case" });
    }

    const changes = [];
    if (title && caseItem.title !== title) changes.push("title updated");
    if (category && caseItem.category !== category) changes.push("category updated");
    if (description && caseItem.description !== description) changes.push("description updated");
    if (status && caseItem.status !== status) changes.push("status updated");
    if (req.file) changes.push("evidence file updated");

    if (changes.length === 0) {
      return res.status(400).json({ success: false, message: "No changes detected" });
    }

    if (title) caseItem.title = title;
    if (category) caseItem.category = category;
    if (description) caseItem.description = description;

    if (status) {
      if (caseItem.status !== status) caseItem.activityLog.push(`Status Updated: ${status}`);
      caseItem.status = status;
    }

    if (assignedPolice) {
      if (caseItem.assignedPolice?.toString() !== assignedPolice) {
        caseItem.activityLog.push("Officer Assignment Updated");
      }
      caseItem.assignedPolice = assignedPolice;
    }

    if (assignedLawyer) {
      if (caseItem.assignedLawyer?.toString() !== assignedLawyer) {
        caseItem.activityLog.push("Lawyer Assignment Updated");
      }
      caseItem.assignedLawyer = assignedLawyer;
    }

    if (req.file) {
      caseItem.evidenceFile = req.file.path;
      caseItem.hash = generateHash(req.file.path);
      caseItem.activityLog.push("Evidence Uploaded / Re-SEALED");
    }

    caseItem.lastEditedBy = req.user._id;
    caseItem.editHistory.push({
      editedBy: req.user._id,
      timestamp: Date.now(),
      changes: changes.join(", ")
    });

    const updatedCase = await caseItem.save();

    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.getCases = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "user") {
      query = { createdBy: req.user._id };
    } else if (req.user.role === "lawyer") {
      query = { assignedLawyer: req.user._id };
    } else if (req.user.role === "police") {
      query = { locality: req.user.locality, district: req.user.district, state: req.user.state };
    }

    const cases = await Case.find(query)
      .populate("createdBy", "fullName role email")
      .populate("assignedPolice", "fullName role")
      .populate("assignedLawyer", "fullName role")
      .populate("lastEditedBy", "fullName role")
      .populate("editHistory.editedBy", "fullName role")
      .populate("verifiedBy", "fullName role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const singleCase = await Case.findById(req.params.id)
      .populate("createdBy", "fullName role email")
      .populate("assignedPolice", "fullName role")
      .populate("assignedLawyer", "fullName role")
      .populate("lastEditedBy", "fullName role")
      .populate("editHistory.editedBy", "fullName role")
      .populate("verifiedBy", "fullName role");

    if (!singleCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }


    const caseData = singleCase.toObject();

    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.getUserCases = async (req, res) => {

  try {

    const cases = await Case.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: cases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.status(200).json({
      success: true,
      message: "Evidence uploaded successfully",
      filePath: req.file.path
    });
  } catch (error) {
    console.error("Error uploading evidence:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    if (caseItem.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this case" });
    }

    await caseItem.deleteOne();

    res.status(200).json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.verifyEvidence = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (!caseItem.evidenceFile) {
      return res.status(400).json({ success: false, message: "No evidence file attached to verify." });
    }

    const currentHash = generateHash(caseItem.evidenceFile);

    if (currentHash === caseItem.hash) {
      caseItem.activityLog.push("Verification Requested - SEAL INTACT");
      await caseItem.save();
      return res.status(200).json({ success: true, message: "SEAL INTACT", verified: true });
    } else {
      caseItem.activityLog.push("Verification Requested - TAMPERED WARNING");
      await caseItem.save();
      return res.status(200).json({ success: true, message: "TAMPERED", verified: false });
    }

  } catch (error) {
    console.error("Error verifying evidence:", error);
    res.status(500).json({ success: false, message: "Verification system error: " + error.message });
  }
};
exports.assignPolice = async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ success: false, message: "Only police can take ownership of a case." });
    }
    
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }
    
    if (caseItem.assignedPolice) {
      return res.status(400).json({ success: false, message: "Case is already assigned to an officer." });
    }
    
    caseItem.assignedPolice = req.user._id;
    caseItem.status = "Under Investigation";
    caseItem.activityLog.push(`Case ownership taken by ${req.user.fullName}`);
    
    const updatedCase = await caseItem.save();
    
    res.status(200).json({ success: true, message: "Case ownership taken successfully.", data: updatedCase });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Note text is required." });
    }

    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    caseItem.notes.push({
      text,
      createdBy: req.user._id
    });
    
    await caseItem.save();

    // Re-fetch or populate to return the complete populated list
    const updatedCase = await Case.findById(req.params.id).populate("notes.createdBy", "fullName role");

    res.status(200).json({ success: true, message: "Note added successfully", data: updatedCase.notes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Under Investigation", "Evidence Review", "Closed"];
    
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (caseItem.status !== status) {
        caseItem.activityLog.push(`Status Updated: ${status}`);
        caseItem.status = status;
        caseItem.lastEditedBy = req.user._id;
        
        await caseItem.save();
    }

    res.status(200).json({ success: true, message: "Case status updated successfully.", data: caseItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.verifyCase = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found." });
    }

    if (caseItem.isVerified) {
      return res.status(400).json({ success: false, message: "Case is already verified." });
    }

    caseItem.isVerified = true;
    caseItem.verifiedBy = req.user._id;
    caseItem.verifiedAt = new Date();
    caseItem.status = "Verified";
    caseItem.activityLog.push(`Verification mathematically sealed by officer ${req.user.fullName || 'System'}`);

    const updatedCase = await caseItem.save();
    
    const populatedCase = await Case.findById(updatedCase._id)
      .populate("createdBy", "fullName role email")
      .populate("assignedPolice", "fullName role")
      .populate("assignedLawyer", "fullName role")
      .populate("verifiedBy", "fullName role");

    res.status(200).json({ success: true, message: "Case successfully verified.", data: populatedCase });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
