const express = require("express");
const router = express.Router();

const { createCase, getCases } = require("../controllers/caseController");

// POST create new case
router.post("/", createCase);

// GET all cases
router.get("/", getCases);

module.exports = router;