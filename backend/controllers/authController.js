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
            role: req.body.role || 'user',
            locality: locality ? String(locality).toLowerCase().trim() : undefined,
            district: district ? String(district).toLowerCase().trim() : undefined,
            state: state ? String(state).toLowerCase().trim() : undefined
        });

        if (user) {
            const token = generateToken(user._id);


            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                locality: user.locality,
                district: user.district,
                state: user.state,
                token,
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
            const token = generateToken(user._id);

            // Set HTTP-only cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                locality: user.locality,
                district: user.district,
                state: user.state,
                token,
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login", error: error.message });
    }
};

const logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching users", error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        fullName: req.body.fullName || user.fullName,
                        locality: req.body.locality !== undefined ? String(req.body.locality).toLowerCase().trim() : user.locality,
                        district: req.body.district !== undefined ? String(req.body.district).toLowerCase().trim() : user.district,
                        state: req.body.state !== undefined ? String(req.body.state).toLowerCase().trim() : user.state,
                    }
                },
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                locality: updatedUser.locality,
                district: updatedUser.district,
                state: updatedUser.state
            });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error updating profile", error: error.message });
    }
};

const getLawyers = async (req, res) => {
    try {
        const lawyers = await User.find({ role: "lawyer" }).select("fullName email _id");
        res.json({ success: true, data: lawyers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error fetching lawyers", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    getLawyers,
};
