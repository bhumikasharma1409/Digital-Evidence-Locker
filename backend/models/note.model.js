const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        evidenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Evidence",
            required: true
        },
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        creatorRole: {
            type: String,
            required: true
        },
        noteType: {
            type: String,
            enum: ['police', 'lawyer', 'internal'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        isPrivate: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
