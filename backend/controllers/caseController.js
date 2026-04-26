const Case = require("../models/case.model");
const crypto = require("crypto");

exports.createCase = async (req, res) => {
  try {
    const { title, category, description } = req.body;


    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    const fakeHash = crypto.randomBytes(32).toString("hex");


    const evidenceFile = req.file ? req.file.path : null;

    const newCase = new Case({
      title,
      category,
      description,
      hash: fakeHash,
      evidenceFile,
      createdBy: req.user._id
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
    const { title, category, description, status } = req.body;
    let caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    if (caseItem.createdBy.toString() !== req.user._id.toString()) {
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
    if (status) caseItem.status = status;
    if (req.file) caseItem.evidenceFile = req.file.path;

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
    }

    const cases = await Case.find(query)
      .populate("createdBy", "fullName role email")
      .populate("lastEditedBy", "fullName role")
      .populate("editHistory.editedBy", "fullName role")
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
      .populate("lastEditedBy", "fullName role")
      .populate("editHistory.editedBy", "fullName role");

    if (!singleCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }


    const caseData = singleCase.toObject();
    caseData.activityLog = [
      "Case Created",
      "Evidence Uploaded",
      "Status: Pending"
    ];

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



