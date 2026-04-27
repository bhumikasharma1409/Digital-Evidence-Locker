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
  locality: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  assignedPolice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
  activityLog: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  notes: [
    {
      text: { type: String, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("Case", caseSchema);