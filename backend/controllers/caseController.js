const Case = require("../models/case.model");

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

    const newCase = new Case({
      title,
      category,
      description,
    });

    const savedCase = await newCase.save();

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: savedCase,
    });

  } catch (error) {
    // This logs the EXACT error to your terminal/VS Code console
    console.error("Error creating case:", error);

    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};


exports.getCases = async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,  // The frontend checks for this
      data: cases     // The frontend looks for this array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};