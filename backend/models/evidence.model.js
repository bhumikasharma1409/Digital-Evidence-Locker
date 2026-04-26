const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
        },
        hash: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "verified", "rejected", "locked"],
            default: "pending"
        },
        isLocked: {
            type: Boolean,
            default: false
        },
        sharedWithPolice: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        sharedWithLawyers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        policeRemarks: [
            {
                text: String,
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                addedAt: { type: Date, default: Date.now }
            }
        ],
        lawyerNotes: [
            {
                text: String,
                lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                addedAt: { type: Date, default: Date.now }
            }
        ],
        accessRequests: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        verifiedAt: {
            type: Date
        },
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rejectedAt: {
            type: Date
        },
        activityLog: [String]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
