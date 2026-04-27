const Evidence = require("../models/evidence.model");
const Case = require("../models/case.model");
const User = require("../models/User");

exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const myEvidence = await Evidence.find({ uploadedBy: userId })
            .populate("caseId", "title status")
            .populate("accessRequests.requestedBy", "fullName role")
            .sort({ createdAt: -1 });

        const sharedEvidence = await Evidence.find({
            $or: [
                { sharedWithLawyers: userId },
                { sharedWithPolice: userId }
            ]
        })
            .populate("caseId", "title")
            .populate("uploadedBy", "fullName role")
            .sort({ createdAt: -1 });

        const statusCounts = {
            verified: myEvidence.filter(e => e.status === "verified").length,
            pending: myEvidence.filter(e => e.status === "pending").length,
            rejected: myEvidence.filter(e => e.status === "rejected").length,
            locked: myEvidence.filter(e => e.status === "locked" || e.isLocked).length,
        };

        res.status(200).json({
            success: true,
            data: { myEvidence, sharedEvidence, statusCounts }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPoliceDashboard = async (req, res) => {
    try {
        const locality = req.user.locality;
        const district = req.user.district;

        // Evidence in police locality
        const localityEvidence = await Evidence.find({
            $or: [
                { locality: locality },
                { district: district },
                { sharedWithPolice: req.user._id }
            ]
        })
            .populate("caseId", "title")
            .populate("uploadedBy", "fullName role locality")
            .sort({ createdAt: -1 });

        const pendingVerification = localityEvidence.filter(e => e.status === "pending");
        const verifiedEvidence = localityEvidence.filter(e => e.status === "verified");

        res.status(200).json({
            success: true,
            data: {
                localityEvidence,
                pendingVerification,
                verifiedEvidence,
                localityAssigned: locality
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLawyerDashboard = async (req, res) => {
    try {
        const locality = req.user.locality;

        const sharedEvidence = await Evidence.find({ sharedWithLawyers: req.user._id })
            .populate("caseId", "title")
            .populate("uploadedBy", "fullName role")
            .sort({ createdAt: -1 });

        const localityEvidence = await Evidence.find({ locality: locality })
            .populate("caseId", "title")
            .populate("uploadedBy", "fullName role")
            .sort({ createdAt: -1 });

        // Filter out locally available evidence that is already shared to avoid duplicates
        const availableInLocality = localityEvidence.filter(
            le => !sharedEvidence.some(se => se._id.toString() === le._id.toString())
        );

        res.status(200).json({
            success: true,
            data: {
                sharedEvidence,
                availableInLocality,
                localityAssigned: locality
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const allEvidence = await Evidence.find()
            .populate("caseId", "title")
            .populate("uploadedBy", "fullName role")
            .sort({ createdAt: -1 });

        const allCases = await Case.find().sort({ createdAt: -1 });
        const allUsers = await User.find().select("-password").sort({ createdAt: -1 });

        const systemStats = {
            totalEvidence: allEvidence.length,
            totalCases: allCases.length,
            totalUsers: allUsers.length
        };

        res.status(200).json({
            success: true,
            data: {
                systemStats,
                recentEvidence: allEvidence.slice(0, 50), // Limited for speed
                recentCases: allCases.slice(0, 50),
                users: allUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
