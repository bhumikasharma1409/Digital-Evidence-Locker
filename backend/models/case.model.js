const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
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
    default: "Pending" // Using Pending as per requirements instead of PENDING enum to match frontend and instructions
  },
  evidenceFile: {
    type: String, // Store uploaded filename/path
  },
  hash: {
    type: String, // Placeholder hash
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Case", caseSchema);