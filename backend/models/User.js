const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Please provide a full name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["user", "admin", "agent", "police", "lawyer", "forensic"],
            default: "user",
        },
        locality: {
            type: String,
            required: [true, "Please provide a locality"],
        },
        district: {
            type: String,
            required: [true, "Please provide a district"],
        },
        state: {
            type: String,
            required: [true, "Please provide a state"],
        },
    },
    { timestamps: true }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
