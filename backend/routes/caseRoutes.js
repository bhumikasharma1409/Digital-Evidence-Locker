const express = require("express");
const router = express.Router();
const Case = require("../models/case.model");


// GET /api/cases -> Get all cases
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find();

    res.status(200).json({
      success: true,
      data: cases,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// POST /api/cases -> Create new case
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newCase = new Case({
      title,
      description,
    });

    const savedCase = await newCase.save();

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: savedCase,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;