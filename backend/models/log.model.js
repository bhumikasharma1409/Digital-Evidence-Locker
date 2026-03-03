const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true, // ✅ Proper timestamp handling
  }
);

module.exports = mongoose.model("Log", logSchema);