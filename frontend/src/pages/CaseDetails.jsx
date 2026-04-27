/**
 * CaseDetails.jsx: Detailed view of a specific evidence case, showing files, status, and activity logs.
 * Accessed by clicking a case in the Dashboard or My Cases pages.
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";
import EvidenceCard from "../components/EvidenceCard";
import { useSocket } from "../context/SocketContext";

// --- Matrix Rain Canvas ---
function MatrixRain() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const cols = Math.floor(canvas.width / 18);
        const drops = Array(cols).fill(1);
        const chars = "01アイウエオカキクケコ░▒▓█ABCDEF0123456789".split("");
        let frame;
        const draw = () => {
            ctx.fillStyle = "rgba(10,15,26,0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "13px monospace";
            drops.forEach((y, i) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const alpha = Math.random() > 0.92 ? 1 : 0.18;
                ctx.fillStyle = `rgba(20,210,160,${alpha})`;
                ctx.fillText(char, i * 18, y * 18);
                if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
            frame = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(frame);
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />;
}

// --- Hex Badge ---
function HexBadge({ label, color = "teal" }) {
    const colors = {
        teal: { bg: "rgba(20,210,160,0.1)", border: "rgba(20,210,160,0.3)", text: "#14d2a0", dot: "bg-teal-400" },
        red: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", dot: "bg-red-400" },
        blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#3b82f6", dot: "bg-blue-400" },
        yellow: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", dot: "bg-yellow-400" },
        green: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", dot: "bg-green-400" },
        purple: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#a855f7", dot: "bg-purple-400" },
    };

    // Map backend statuses to specific cyber colors
    let finalColor = color;
    if (label) {
        const check = label.toString().toUpperCase();
        if (check.includes("PENDING")) finalColor = "yellow";
        else if (check.includes("ASSIGNED") || check.includes("INVESTIGATION")) finalColor = "blue";
        else if (check.includes("VERIFIED")) finalColor = "purple";
        else if (check.includes("CLOSED")) finalColor = "green";
    }

    const c = colors[finalColor] || colors.teal;

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: "'Share Tech Mono', monospace"
        }}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
            {label}
        </div>
    );
}

// --- Glitch Text Element ---
function GlitchText({ text }) {
    return (
        <span className="relative inline-block" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            <style>{`
            @keyframes glitch1 {
                0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-2px,0)}
                20%{clip-path:inset(20% 0 60% 0);transform:translate(2px,0)}
                40%{clip-path:inset(50% 0 30% 0);transform:translate(-1px,0)}
                60%{clip-path:inset(80% 0 5% 0);transform:translate(1px,0)}
                80%{clip-path:inset(10% 0 80% 0);transform:translate(0,0)}
            }
            @keyframes glitch2 {
                0%,100%{clip-path:inset(90% 0 0 0);transform:translate(2px,0)}
                20%{clip-path:inset(60% 0 25% 0);transform:translate(-2px,0)}
                40%{clip-path:inset(30% 0 55% 0);transform:translate(1px,0)}
                60%{clip-path:inset(5% 0 85% 0);transform:translate(-1px,0)}
                80%{clip-path:inset(75% 0 15% 0);transform:translate(0,0)}
            }
            `}</style>
            {text}
            <span aria-hidden="true" className="absolute inset-0 text-teal-400 opacity-70" style={{ animation: "glitch1 3s infinite linear", content: `"${text}"` }}>{text}</span>
            <span aria-hidden="true" className="absolute inset-0 text-blue-400 opacity-70" style={{ animation: "glitch2 3s infinite linear 0.5s", content: `"${text}"` }}>{text}</span>
        </span>
    );
}

// Evidence File Renderer helper
const renderEvidenceFile = (filePath) => {
    if (!filePath) return null;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const SERVER_URL = `${API_BASE_URL}/`;
    const fullUrl = filePath.startsWith("http") ? filePath : SERVER_URL + filePath.replace(/\\/g, '/');
    const ext = fullUrl.split('.').pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        return (
            <div className="relative group rounded-xl overflow-hidden border border-teal-500/30" style={{ aspectRatio: '16/9' }}>
                <img src={fullUrl} alt="Evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a href={fullUrl} target="_blank" rel="noreferrer" className="px-4 py-2 border border-teal-400 text-teal-400 rounded-lg text-xs font-bold font-mono hover:bg-teal-400/20 transition-colors">
                        [ ENLARGE_EVIDENCE ]
                    </a>
                </div>
            </div>
        );
    } else if (["mp4", "webm", "ogg"].includes(ext)) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-blue-500/30 bg-black" style={{ aspectRatio: '16/9' }}>
                <video src={fullUrl} controls className="w-full h-full object-contain" />
            </div>
        );
    } else {
        return (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-700 bg-black/40">
                <svg className="w-16 h-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <a href={fullUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-sm font-bold tracking-wider font-mono border border-slate-600 transition-colors shadow-lg">
                    DOWNLOAD RAW EVIDENCE
                </a>
            </div>
        );
    }
};

export default function CaseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Custom UI states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // New states for File Upload & Update
    const [uploading, setUploading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const evidenceFileInputRef = useRef(null);

    const userRole = localStorage.getItem("role") || "user";
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [usersList, setUsersList] = useState([]);
    
    // Notes logic
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [addingNote, setAddingNote] = useState(false);
    
    // Legacy single-evidence fields (removed verify/verificatioResult since we use EvidenceCard)
    const [evidenceList, setEvidenceList] = useState([]);

    const fetchUsers = async (token) => {
        if (["admin", "police"].includes(userRole)) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
                const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUsersList(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load users for assignment:", err);
            }
        }
    };

    const fetchCaseData = async () => {
        if (!id || id === ":id") {
            setError("Invalid Case ID provided in the URL directory.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
                setLoading(true);
                const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
                const response = await axios.get(`${API_BASE_URL}/api/cases/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCaseData(response.data.data);
                if (response.data.data.notes) setNotes(response.data.data.notes);

                // Fetch Profile for loggedInUserId
                try {
                    const profileRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (profileRes.data && profileRes.data._id) {
                        setLoggedInUserId(profileRes.data._id);
                    }
                } catch(e) {}

                fetchUsers(token);
                fetchEvidence(token);
            } catch (err) {
                console.error("Error fetching case details:", err.response || err);

                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    setError("Session expired, please login again");
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                setError(err.response?.data?.message || err.message || "Unable to load case details. Connection securely terminated.");
            } finally {
                setLoading(false);
            }
    };

    const fetchEvidence = async (token) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const response = await axios.get(`${API_BASE_URL}/api/evidence/case/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setEvidenceList(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching native evidence list:", err);
        }
    };

    useEffect(() => {
        fetchCaseData();

        if (socket && id) {
            socket.emit("joinCase", id);

            socket.on("caseUpdated", (updatedCase) => {
                if (updatedCase._id === id) {
                    setCaseData(prev => ({ ...prev, ...updatedCase }));
                }
            });

            socket.on("noteAdded", (updatedNotes) => {
                setNotes(updatedNotes);
            });

            socket.on("evidenceUploaded", () => {
                fetchEvidence(localStorage.getItem("token"));
            });

            socket.on("evidenceUpdated", () => {
                fetchEvidence(localStorage.getItem("token"));
            });

            return () => {
                socket.off("caseUpdated");
                socket.off("noteAdded");
                socket.off("evidenceUploaded");
                socket.off("evidenceUpdated");
            };
        }
    }, [id, navigate, socket]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-teal-400">
                <MatrixRain />
                <div className="relative z-10 flex flex-col items-center animate-pulse">
                    <svg className="w-16 h-16 mb-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <p className="font-mono tracking-widest text-sm font-bold">DECRYPTING RECORD...</p>
                </div>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-center">
                <div className="relative z-10 max-w-lg p-8 rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl text-red-400 font-bold mb-2 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>ACCESS DENIED</h2>
                    <p className="text-slate-400 font-mono text-sm">{error || "Record could not be verified in the ledger."}</p>
                    <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 border border-red-500/50 text-red-400 rounded-lg text-sm font-bold font-mono hover:bg-red-500/10 transition-colors">
                        RETURN TO DIRECTORY
                    </button>
                </div>
            </div>
        );
    }

    const {
        title,
        category,
        description,
        evidenceFile,
        hash,
        status,
        activityLog,
        createdAt,
        updatedAt,
        assignedPolice,
        assignedLawyer,
        createdBy
    } = caseData;

    // Unified logs: prefer auditLogs objects, fallback to legacy activityLog strings
    const logs = (caseData && caseData.auditLogs && caseData.auditLogs.length > 0)
        ? caseData.auditLogs
        : (activityLog || []);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteCase = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const res = await axios.delete(`${API_BASE_URL}/api/cases/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setShowDeleteModal(false);
                setToastMessage({ text: "Case deleted successfully", type: "success" });
                setTimeout(() => {
                    navigate("/my-cases");
                }, 2000);
            }
        } catch (err) {
            console.error("Error deleting case:", err);
            setShowDeleteModal(false);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                if (err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setToastMessage({ text: err.response.data.message || "Not authorized to delete this case.", type: "error" });
                }
                return;
            }
            setToastMessage({ text: "Failed to delete the case.", type: "error" });
        }
    };

    const handleUploadEvidence = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            const formData = new FormData();
            formData.append("evidenceFile", file);
            formData.append("caseId", id);

            await axios.post(`${API_BASE_URL}/api/evidence`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            
            setToastMessage({ text: "Cryptographic Evidence generated and sealed successfully.", type: "success" });
            await fetchEvidence(token); // Refresh the evidence list immediately
        } catch (err) {
            console.error("Upload error:", err);
            setToastMessage({ text: err.response?.data?.message || "Failed to seal evidence.", type: "error" });
        } finally {
            setUploading(false);
            if (evidenceFileInputRef.current) {
                evidenceFileInputRef.current.value = "";
            }
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        if (!newStatus || newStatus === status) return;
        
        try {
            setStatusUpdating(true);
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            await axios.put(`${API_BASE_URL}/api/cases/${id}`, { status: newStatus }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            setToastMessage({ text: `Case status reclassified to ${newStatus}`, type: "success" });
            fetchCaseData();
        } catch (err) {
            console.error("Status update error:", err);
            setToastMessage({ text: err.response?.data?.message || "Failed to reclassify status.", type: "error" });
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleAssignUser = async (field, value) => {
        try {
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            await axios.put(`${API_BASE_URL}/api/cases/${id}`, { [field]: value || null }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            setToastMessage({ text: `Assignment updated successfully.`, type: "success" });
            fetchCaseData();
        } catch (err) {
            console.error("Assignment update error:", err);
            setToastMessage({ text: "Failed to allocate assignment.", type: "error" });
        }
    };

    const handleTakeOwnership = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            await axios.patch(`${API_BASE_URL}/api/cases/${id}/assign-police`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            setToastMessage({ text: "Ownership taken successfully.", type: "success" });
            fetchCaseData();
        } catch (err) {
            console.error("Take ownership error:", err);
            setToastMessage({ text: err.response?.data?.message || "Failed to take ownership.", type: "error" });
        }
    };

    const handleVerifyCase = async () => {
        try {
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            await axios.patch(`${API_BASE_URL}/api/cases/${id}/verify`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            setToastMessage({ text: "Case successfully verified.", type: "success" });
            fetchCaseData();
        } catch (err) {
            console.error("Verify case error:", err);
            setToastMessage({ text: err.response?.data?.message || "Failed to verify case.", type: "error" });
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            setAddingNote(true);
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            const response = await axios.post(`${API_BASE_URL}/api/cases/${id}/notes`, { text: newNote }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            setNotes(response.data.data);
            setNewNote("");
            setToastMessage({ text: "Note added successfully", type: "success" });
        } catch (err) {
            console.error("Add note error:", err);
            setToastMessage({ text: err.response?.data?.message || "Failed to add note.", type: "error" });
        } finally {
            setAddingNote(false);
        }
    };

    // Calculate Permissions
    const isAssignedPolice = userRole === "police" && assignedPolice?._id === loggedInUserId;
    const isAssignedLawyer = userRole === "lawyer" && assignedLawyer?._id === loggedInUserId;
    const isOtherPolice = userRole === "police" && assignedPolice && assignedPolice._id !== loggedInUserId;
    const canEditStatus = ["admin", "forensic"].includes(userRole) || isAssignedPolice;
    const canUploadEvidence = ["admin", "forensic", "user"].includes(userRole) || isAssignedPolice;
    const canSeeNotes = ["admin", "lawyer"].includes(userRole) || (userRole === "police" && assignedPolice);

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden relative" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <style>{`
              @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
              .grid-bg { background-image: linear-gradient(rgba(20,210,160,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,210,160,0.04) 1px, transparent 1px); background-size: 40px 40px; }
              @keyframes scanline { 0% { transform: translateY(-5%); } 100% { transform: translateY(105vh); } }
              .scanline { pointer-events: none; position: fixed; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(transparent, rgba(20,210,160,0.06), transparent); animation: scanline 8s linear infinite; z-index: 999; }
            `}</style>

            <div className="scanline" />
            <div className="absolute inset-0 grid-bg opacity-50" />
            <MatrixRain />

            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

                {/* Action Buttons */}
                <div className="flex justify-between items-center mb-8" style={{ animation: "fadeSlideUp 0.6s ease both" }}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/my-cases')} className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-mono text-xs uppercase tracking-widest">
                            <span>←</span> BACK TO DIRECTORY
                        </button>
                        {userRole && (
                            <HexBadge 
                                label={`${userRole.toUpperCase()} SESSION`} 
                                color={userRole === "police" ? "blue" : userRole === "lawyer" ? "purple" : "teal"} 
                            />
                        )}
                    </div>

                    {["admin", "police"].includes(userRole) && (
                        <button onClick={handleDeleteClick} className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs font-bold font-mono transition-colors">
                            <span>🗑️ DELETE RECORD</span>
                        </button>
                    )}
                </div>

                {/* HEADER SECTION */}
                <div className="mb-12" style={{ animation: "fadeSlideUp 0.6s ease 0.1s both" }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                        <div className="flex-1 w-full max-w-2xl">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <div className="relative group/status">
                                    <HexBadge label={status || "Pending"} color="teal" />
                                    
                                    {canEditStatus && (
                                        <>
                                            <select 
                                                value={status || "Pending"} 
                                                onChange={handleStatusChange}
                                                disabled={statusUpdating}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                                                title="Shift case classification"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Under Investigation">Under Investigation</option>
                                                <option value="Verified">Verified</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                            
                                            {statusUpdating && (
                                                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <HexBadge label={caseData.isVerified ? "Verified" : "Not Verified"} color={caseData.isVerified ? "green" : "yellow"} />
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400">
                                    ID: {id}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight break-words" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                <GlitchText text={title} />
                            </h1>
                        </div>


                        <div className="md:text-right p-4 rounded-xl bg-black/40 border border-teal-500/20 shadow-[0_0_15px_rgba(20,210,160,0.05)] space-y-4">
                            {/* Officer Alignment */}
                            <div className="flex flex-col md:items-end gap-1">
                                <div className="text-[10px] text-slate-500 font-bold tracking-widest font-mono uppercase">ASSIGNED EXAMINER</div>
                                {userRole === "police" && !assignedPolice && (
                                    <button onClick={handleTakeOwnership} className="px-3 py-1 border border-teal-500/50 bg-teal-500/10 text-teal-400 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-teal-500/20 transition-colors">
                                        🛡️ TAKE OWNERSHIP
                                    </button>
                                )}
                                {assignedPolice ? (
                                    <div className="text-sm text-teal-300 font-mono">{assignedPolice.fullName}</div>
                                ) : userRole !== "police" ? (
                                    <div className="text-sm text-slate-500 font-mono">UNASSIGNED</div>
                                ) : null}

                                {isAssignedPolice && !caseData.isVerified && (
                                    <button onClick={handleVerifyCase} className="mt-2 px-3 py-1 border border-purple-500/50 bg-purple-500/10 text-purple-400 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-purple-500/20 transition-colors">
                                        ✅ VERIFY CASE
                                    </button>
                                )}
                                {caseData.isVerified && (
                                    <div className="mt-2 text-[10px] text-green-400 font-bold tracking-widest font-mono uppercase border border-green-500/30 bg-green-500/10 px-2 py-1 rounded inline-block">
                                        ✅ Verified by Police
                                    </div>
                                )}
                            </div>

                            {/* Lawyer Alignment */}
                            <div className="flex flex-col md:items-end gap-1">
                                <div className="text-[10px] text-slate-500 font-bold tracking-widest font-mono uppercase">LEGAL OVERSIGHT</div>
                                {["admin"].includes(userRole) ? (
                                    <select 
                                        value={assignedLawyer?._id || ""}
                                        onChange={(e) => handleAssignUser("assignedLawyer", e.target.value)}
                                        className="bg-black/60 border border-blue-500/40 text-blue-400 text-xs px-2 py-1 rounded font-mono w-full md:w-auto"
                                    >
                                        <option value="">-- UNASSIGNED --</option>
                                        {usersList.filter(u => u.role === "lawyer").map(u => (
                                            <option key={u._id} value={u._id}>{u.fullName} [LAWYER]</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-sm text-blue-300 font-mono">{assignedLawyer ? assignedLawyer.fullName : "UNASSIGNED"}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">

                    {/* LEFT COLUMN: Case Info & Activity */}
                    <div className="md:col-span-1 space-y-8">

                        {/* Case Information Section */}
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl" style={{ animation: "fadeSlideUp 0.6s ease 0.2s both" }}>
                            <div className="flex items-center gap-2 mb-6 text-teal-400 text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-white/5 pb-3">
                                <span>📋</span>
                                <span>Metadata</span>
                            </div>

                            <dl className="space-y-5">
                                <div>
                                    <dt className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Opened On</dt>
                                    <dd className="text-sm text-slate-300 font-mono">{new Date(createdAt).toLocaleString()}</dd>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                                <div>
                                    <dt className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Last Update</dt>
                                    <dd className="text-sm text-slate-300 font-mono text-teal-400">{updatedAt ? new Date(updatedAt).toLocaleString() : 'Recently verified'}</dd>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                                <div>
                                    <dt className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 font-mono">Threat Category</dt>
                                    <dd className="text-sm font-bold text-slate-300 font-mono">{category}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Activity Log Section */}
                        <div className="p-6 rounded-2xl bg-black/40 border border-blue-500/20 backdrop-blur-md relative overflow-hidden" style={{ animation: "fadeSlideUp 0.6s ease 0.3s both" }}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

                            <div className="flex items-center gap-2 mb-6 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] font-mono border-b border-blue-500/10 pb-3 relative z-10">
                                <span>⚡</span>
                                <span>Audit Log</span>
                            </div>

                            <div className="relative border-l border-blue-500/20 ml-2 space-y-6 relative z-10">
                                {logs && logs.length > 0 ? (
                                    logs.map((entry, index) => {
                                        const isString = typeof entry === 'string';
                                        const timestamp = isString ? null : entry.timestamp;
                                        const message = isString ? entry : (entry.message || entry.action);
                                        const role = isString ? 'system' : (entry.role || 'system');
                                        return (
                                            <div key={index} className="pl-4 relative">
                                                <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                                <div className="text-xs text-slate-400 font-mono mb-1">{timestamp ? new Date(timestamp).toLocaleString() : 'System automated entry'}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm text-slate-200 font-mono font-bold leading-tight relative inline-block">{message}</div>
                                                    <div className="text-xs text-slate-400 font-mono">— {role.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="pl-4 text-xs text-slate-500 font-mono italic">No tracking data available.</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Description & Evidence Locker */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Incident Report */}
                        <div className="p-6 md:p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md" style={{ animation: "fadeSlideUp 0.6s ease 0.4s both" }}>
                            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Incident Report</h2>
                            
                            {isOtherPolice && (
                                <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold tracking-widest uppercase">
                                    ⚠️ THIS CASE IS ASSIGNED TO ANOTHER OFFICER. READ-ONLY ACCESS.
                                </div>
                            )}

                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>

                        {/* INTERNAL NOTES (Police/Lawyer) */}
                        {canSeeNotes && (
                            <div className="p-6 md:p-8 rounded-2xl bg-black/40 border border-yellow-500/20 backdrop-blur-md" style={{ animation: "fadeSlideUp 0.6s ease 0.45s both" }}>
                                <h2 className="text-xl font-bold text-yellow-400 mb-4 tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Internal Notes</h2>
                                <div className="space-y-4 mb-6">
                                    {notes.length > 0 ? notes.map((note, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                            <div className="text-[10px] text-yellow-500/70 uppercase tracking-widest font-mono mb-2 flex justify-between">
                                                <span>{note.createdBy?.fullName || "Agent"} [{note.role || note.createdBy?.role || "System"}]</span>
                                                <span>{new Date(note.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{note.text}</div>
                                        </div>
                                    )) : (
                                        <div className="text-xs text-slate-500 italic font-mono">No internal notes present.</div>
                                    )}
                                </div>
                                {(isAssignedPolice || isAssignedLawyer) && (
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Add internal investigation note..."
                                            className="flex-1 bg-black/60 border border-yellow-500/30 rounded text-sm px-3 py-2 text-yellow-100 placeholder:text-yellow-500/30 focus:outline-none focus:border-yellow-500 font-mono"
                                        />
                                        <button onClick={handleAddNote} disabled={addingNote || !newNote.trim()} className="px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded text-xs font-bold uppercase hover:bg-yellow-500/20 disabled:opacity-50 transition-colors">
                                            {addingNote ? "ADDING..." : "ADD NOTE"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EVIDENCE LOCKER SECTION */}
                        <div className="rounded-2xl border border-teal-500/20 bg-[#06101c]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(20,210,160,0.05)] relative" style={{ animation: "fadeSlideUp 0.6s ease 0.5s both" }}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50" />

                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap items-end justify-between gap-4 mb-6 border-b border-teal-500/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-teal-500/40 bg-teal-500/10 shadow-[0_0_15px_rgba(20,210,160,0.15)] text-teal-400">
                                            🗄️
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Evidence Vault</h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-slate-800 text-xs font-mono text-slate-400">
                                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_5px_#14d2a0]" />
                                        {evidenceList.length > 0 ? `${evidenceList.length} ITEMS DECRYPTED` : "NO EVIDENCE FOUND"}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {evidenceList.map(ev => (
                                        <EvidenceCard 
                                            key={ev._id} 
                                            evidence={ev} 
                                            userRole={userRole} 
                                            caseCreatorId={caseData.createdBy?._id || caseData.createdBy}
                                            currentUserId={loggedInUserId}
                                            refreshData={() => fetchEvidence(localStorage.getItem("token"))} 
                                            usersList={usersList} 
                                        />
                                    ))}

                                    {/* Upload Trigger Area */}
                                    {canUploadEvidence && (
                                        <div className={`mt-8 pt-8 border-t border-teal-500/10 ${evidenceList.length === 0 ? 'text-center p-8 border-2 border-dashed border-teal-500/30 rounded-xl bg-teal-500/5 hover:bg-teal-500/10' : ''}`}>
                                            <input 
                                                type="file" 
                                                ref={evidenceFileInputRef} 
                                                onChange={handleUploadEvidence} 
                                                className="hidden" 
                                            />
                                            {evidenceList.length === 0 && (
                                                <div className="mb-4 text-4xl block">📤</div>
                                            )}
                                            <button 
                                                onClick={() => evidenceFileInputRef.current?.click()}
                                                disabled={uploading}
                                                className={`px-6 py-2.5 bg-teal-500 text-black hover:bg-teal-400 font-bold text-xs uppercase tracking-widest font-mono rounded-lg transition-transform ${evidenceList.length > 0 ? '' : 'hover:scale-105'}`}
                                            >
                                                {uploading ? (
                                                    <><span className="animate-spin inline-block">⏳</span> SYNCING TO LEDGER...</>
                                                ) : (
                                                    evidenceList.length > 0 ? "+ UPLOAD NEW EVIDENCE" : "INITIALIZE EVIDENCE RECORD"
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Custom UI Overlays */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Confirm Deletion"
                message="Are you sure you want to delete this case? This action is permanent and destroys the cryptographic evidence seal."
                confirmText="DELETE PERMANENTLY"
                cancelText="ABORT"
                onConfirm={confirmDeleteCase}
                onCancel={() => setShowDeleteModal(false)}
            />

            {toastMessage && (
                <Toast
                    message={toastMessage.text}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
}
