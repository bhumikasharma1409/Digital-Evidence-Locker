const Case = require("../models/case.model");
const crypto = require("crypto");

exports.createCase = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    // 1. Validation check
    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Generate a fake SHA-256 style hash using Node crypto
    const fakeHash = crypto.randomBytes(32).toString("hex");

    // Check if evidence file was uploaded with this request
    const evidenceFile = req.file ? req.file.path : null;

    const newCase = new Case({
      title,
      category,
      description,
      hash: fakeHash,
      evidenceFile,
      user: req.user._id // Tagging the creator of the evidence
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


exports.getCases = async (req, res) => {
  try {
    // Only return cases belonging to the logged-in user
    const cases = await Case.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const singleCase = await Case.findById(req.params.id);
    if (!singleCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    // Adding hardcoded activity log for Evaluation-1 as per requirements
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
  // In Evaluation-1, since we don't have full auth, we can just return all cases or mock it.
  // We'll return all cases for now to satisfy the "My Cases page" frontend data need
  try {
    // const cases = await Case.find({ user: req.params.userId }).sort({ createdAt: -1 });
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

    // Verify ownership: req.user._id is populated by the protect middleware
    if (caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this case" });
    }

    await caseItem.deleteOne();

    res.status(200).json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};