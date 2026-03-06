const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
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
  }
  ,
  status: {
    type: String,
    enum: ["PENDING", "ASSIGNED", "VERIFIED", "CLOSED"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Case", caseSchema);