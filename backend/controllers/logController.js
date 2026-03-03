const Log = require("../models/log.model");
const Case = require("../models/case.model");

exports.getCaseActivity = async (req, res) => {
  try {
    const caseId = req.params.id;

    // ✅ Validate case existence
    const existingCase = await Case.findById(caseId);

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // ✅ Fetch logs for the case (read-only)
    const logs = await Log.find({ caseId })
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      totalActivities: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};