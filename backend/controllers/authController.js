const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key_change_in_production", {
        expiresIn: "30d",
    });
};


const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, locality, district, state } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }


        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }


        const user = await User.create({
            fullName,
            email,
            password,
            role: req.body.role || 'user', // allow role strictly for initial setup/testing
            locality,
            district,
            state
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Server error during registration", error: error.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        const user = await User.findOne({ email }).select("+password");
        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role, // Return the role to the frontend
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login", error: error.message });
    }
};


const getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching profile", error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching users", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
};
