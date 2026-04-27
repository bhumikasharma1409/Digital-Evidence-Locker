const Case = require("../models/case.model");
const crypto = require("crypto");

exports.createCase = async (req, res) => {
  try {
    const { title, category, description, assignedLawyer } = req.body;

    if (!title || !category || !description || !assignedLawyer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including an assigned lawyer",
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
      createdBy: req.user._id,
      assignedLawyer: assignedLawyer,
      district: req.user.district,
      state: req.user.state,
      assignedPolice: null
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
    let filter = {};
    if (req.user.role === "police") {
      filter = { district: req.user.district, state: req.user.state };
    } else if (req.user.role === "lawyer") {
      filter = { assignedLawyer: req.user._id };
    } else {
      filter = { createdBy: req.user._id };
    }

    const cases = await Case.find(filter)
      .populate("assignedPolice", "fullName")
      .populate("assignedLawyer", "fullName")
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
      .populate("assignedPolice", "fullName role district")
      .populate("assignedLawyer", "fullName role")
      .populate("createdBy", "fullName")
      .populate("notes.author", "fullName role")
      .populate("verifiedBy", "fullName role");
      
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



exports.assignPolice = async (req, res) => {
  try {
    if (req.user.role !== "police") {
      return res.status(403).json({ success: false, message: "Only police can take ownership" });
    }

    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    if (caseItem.assignedPolice) {
      return res.status(400).json({ success: false, message: "Case is already claimed by an officer" });
    }

    caseItem.assignedPolice = req.user._id;
    caseItem.status = "Under Investigation";

    const updatedCase = await caseItem.save();

    res.status(200).json({
      success: true,
      message: "Successfully took ownership of the case",
      data: updatedCase
    });
  } catch (error) {
    console.error("Error assigning police:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Under Investigation", "Evidence Review", "CLOSED"];
    
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedCase
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Note text is required" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            text: text.trim(),
            author: req.user._id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate("notes.author", "fullName role");

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: updatedCase.notes[updatedCase.notes.length - 1]
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.verifyCase = async (req, res) => {
  try {
    // req.caseItem is populated by requireAssignedPolice
    if (req.caseItem.isVerified) {
      return res.status(400).json({ success: false, message: "Case is already verified" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      },
      { new: true }
    ).populate("verifiedBy", "fullName role");

    res.status(200).json({
      success: true,
      message: "Case verified successfully",
      data: updatedCase
    });
  } catch (error) {
    console.error("Error verifying case:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

exports.getCookies = (req, res) => { res.send("cookies"); };