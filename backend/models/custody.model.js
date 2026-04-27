const mongoose = require("mongoose");

const custodySchema = new mongoose.Schema(
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
        actionTitle: {
            type: String,
            required: true
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        actorRole: {
            type: String,
            required: true
        },
        details: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("CustodyLog", custodySchema);
