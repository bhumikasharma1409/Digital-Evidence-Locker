const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key_change_in_production", {
        expiresIn: "30d",
    });
};


const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, locality, district, state, role } = req.body;

        if (!fullName || !email || !password || !locality || !district || !state) {
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
            locality: locality.trim().toLowerCase(),
            district: district.trim().toLowerCase(),
            state: state.trim().toLowerCase(),
            role: role || "user",
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
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
                locality: user.locality,
                district: user.district,
                state: user.state,
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching profile", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            
            if (req.body.locality !== undefined) {
                user.locality = req.body.locality.trim().toLowerCase();
            }
            if (req.body.district !== undefined) {
                user.district = req.body.district.trim().toLowerCase();
            }
            if (req.body.state !== undefined) {
                user.state = req.body.state.trim().toLowerCase();
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                locality: updatedUser.locality,
                district: updatedUser.district,
                state: updatedUser.state,
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error updating profile", error: error.message });
    }
};

const getLawyers = async (req, res) => {
    try {
        const lawyers = await User.find({ role: "lawyer" }).select("fullName _id district state");
        res.json({ success: true, data: lawyers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching lawyers", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getLawyers,
};
