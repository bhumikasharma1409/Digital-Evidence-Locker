const Case = require("../models/case.model");

// CREATE NEW CASE
const createCase = async (req, res) => {
  try {
    const { caseTitle, caseDescription, officerAssigned, status } = req.body;

    // Check required fields
    if (!caseTitle || !caseDescription || !officerAssigned) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const newCase = new Case({
      caseTitle,
      caseDescription,
      officerAssigned,
      status: status || "OPEN"
    });

    const savedCase = await newCase.save();

    res.status(201).json({
      message: "Case created successfully",
      case: savedCase
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  createCase
};