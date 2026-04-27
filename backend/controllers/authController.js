const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key_change_in_production", {
        expiresIn: "30d",
    });
};


const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, state, district, locality, pincode, policeStationArea } = req.body;

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
            role: 'user', // explicitly hardcoded to prevent injection
            state,
            district,
            locality,
            pincode,
            policeStationArea
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                state: user.state,
                district: user.district,
                locality: user.locality,
                pincode: user.pincode,
                policeStationArea: user.policeStationArea,
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
        const { email, password, expectedRole } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (user && (await user.matchPassword(password))) {
            if (expectedRole && user.role !== expectedRole) {
                return res.status(403).json({ success: false, message: `Access Unauthorized: Account lacks ${expectedRole} privileges.` });
            }
            res.json({
                success: true,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role, // Return the role to the frontend
                state: user.state,
                district: user.district,
                locality: user.locality,
                pincode: user.pincode,
                policeStationArea: user.policeStationArea,
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
                state: user.state,
                district: user.district,
                locality: user.locality,
                pincode: user.pincode,
                policeStationArea: user.policeStationArea,
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

const updateLocality = async (req, res) => {
    try {
        const { state, district, locality, pincode, policeStationArea } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.state = state || user.state;
        user.district = district || user.district;
        user.locality = locality || user.locality;
        user.pincode = pincode || user.pincode;
        user.policeStationArea = policeStationArea || user.policeStationArea;

        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const createPolice = async (req, res) => {
    try {
        const { fullName, email, password, state, district, locality, pincode, policeStationArea } = req.body;
        if (!fullName || !email || !password) return res.status(400).json({ success: false, message: "Provide required fields" });
        
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: "User exists" });

        const user = await User.create({ fullName, email, password, role: 'police', state, district, locality, pincode, policeStationArea });
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createLawyer = async (req, res) => {
    try {
        const { fullName, email, password, state, district, locality, pincode } = req.body;
        if (!fullName || !email || !password) return res.status(400).json({ success: false, message: "Provide required fields" });
        
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: "User exists" });

        const user = await User.create({ fullName, email, password, role: 'lawyer', state, district, locality, pincode });
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updateLocality,
    createPolice,
    createLawyer
};