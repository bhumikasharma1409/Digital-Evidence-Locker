const express = require("express");
const router = express.Router();
const Case = require("../models/case.model");

// Create a new case
router.post("/", async (req, res) => {
  try {
    const newCase = await Case.create({
      title: req.body.title,
      description: req.body.description,
    });

    res.status(201).json({
      success: true,
      data: newCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Temporary route to create a case from browser
router.get("/create-test", async (req, res) => {
  try {
    const newCase = await Case.create({
      title: "Test Case",
      description: "Created from browser",
    });

    res.json(newCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;