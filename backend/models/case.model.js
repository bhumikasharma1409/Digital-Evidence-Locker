const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  editHistory: [
    {
      editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
      changes: { type: String }
    }
  ],
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  },
  evidenceFile: {
    type: String,
  },
  hash: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);