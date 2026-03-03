const express = require("express");
const router = express.Router();
const { getCaseActivity } = require("../controllers/logController");

router.get("/case/:id/activity", getCaseActivity);

module.exports = router;