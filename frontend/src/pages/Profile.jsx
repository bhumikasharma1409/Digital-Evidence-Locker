import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "../components/Toast";

// --- Matrix Rain Canvas ---
function MatrixRain() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const cols = Math.floor(canvas.width / 18);
        const drops = Array(cols).fill(1);
        const chars = "01아이ウエオカキクケコ░▒▓█ABCDEF0123456789".split("");
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

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({ fullName: "", locality: "", district: "", state: "" });
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                // Call directly since we just need simple profile mapping without axios
                const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
                const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.status === 401) {
                    throw new Error("unauthorized");
                }

                if (!response.ok) {
                    throw new Error("Failed to load user profile");
                }

                const data = await response.json();

                if (data.success) {
                    setUser(data);
                    setEditData({
                        fullName: data.fullName || "",
                        locality: data.locality || "",
                        district: data.district || "",
                        state: data.state || ""
                    });
                } else {
                    throw new Error(data.message || "Failed to load user profile");
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);

                // If token fails or is invalid, force them to re-authenticate
                if (err.message === "unauthorized") {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setError("Failed to communicate with authentication servers.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            const response = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, editData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setUser(response.data);
                setIsEditing(false);
                setToastMessage({ text: "Profile Updated", type: "success" });
            }
        } catch (err) {
            console.error("Error updating profile:", err.response?.data || err);
            setToastMessage({ text: err.response?.data?.message || "Failed to update profile.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center text-teal-400 font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
                    <span>VERIFYING_IDENTIFICATION...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#0a0f1a] flex flex-col items-center justify-center p-6">
                <div className="text-red-500 font-mono text-center max-w-md p-8 rounded-2xl border border-red-500/20 bg-red-500/5 mb-6">
                    <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">CLEARANCE_REJECTED</h2>
                    <p className="text-sm opacity-80 mb-6">{error}</p>
                </div>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 rounded-lg border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-widest hover:bg-teal-500/10 transition-all"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                    Return to Authenticator
                </button>
            </div>
        );
    }

    // Default mock data just in case structure differs
    const displayUser = user || { fullName: "UNKNOWN AGENT", email: "REDACTED", role: "user", locality: "-", district: "-", state: "-" };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden relative flex flex-col pt-12 pb-32" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
                .grid-bg{background-image:linear-gradient(rgba(20,210,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,210,160,0.04) 1px,transparent 1px);background-size:40px 40px;}
                @keyframes scanline{0%{transform:translateY(-5%)}100%{transform:translateY(105vh)}}
                .scanline{pointer-events:none;position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(20,210,160,0.06),transparent);animation:scanline 8s linear infinite;z-index:999;}
            `}</style>

            <div className="scanline" />
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
            <MatrixRain />

            <div className="absolute top-1/4 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />

            <div className="relative z-10 max-w-3xl mx-auto px-6 w-full">
                {/* Header Navigation */}
                <div className="mb-10 flex items-center justify-between" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-bold tracking-widest uppercase"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        <span>←</span> BACK TO TERMINAL
                    </button>

                    <div className="flex gap-4">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors text-xs font-bold tracking-widest uppercase"
                                style={{ fontFamily: "'Share Tech Mono', monospace" }}
                            >
                                EDIT PROFILE
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold tracking-widest uppercase"
                            style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                            DISCONNECT LOGIC
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="p-8 md:p-10 rounded-2xl border relative overflow-hidden flex flex-col items-center text-center" style={{
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(20,210,160,0.3)",
                    boxShadow: "0 0 40px rgba(20,210,160,0.05)",
                    animation: "fadeSlideUp 0.8s ease 0.1s both"
                }}>

                    {/* Glowing Avatar */}
                    <div className="relative mb-6 group">
                        <div className="absolute -inset-1 rounded-full opacity-50 blur-md group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #14d2a0, #3b82f6)" }}></div>
                        <div className="relative w-28 h-28 rounded-full border-2 border-teal-400/50 flex items-center justify-center text-4xl" style={{ background: "#0a0f1a", boxShadow: "inset 0 0 20px rgba(20,210,160,0.2)" }}>
                            🕵️
                        </div>
                    </div>

                    <div className="text-xs text-teal-400 font-black uppercase tracking-[0.4em] mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        ── AUTHORIZED PERSONNEL ──
                    </div>

                    {isEditing ? (
                        <input
                            type="text"
                            value={editData.fullName}
                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                            className="text-2xl md:text-3xl font-black text-center bg-black/60 border border-teal-500/40 text-teal-400 px-3 py-1 rounded focus:outline-none focus:border-teal-400 mb-2 w-full max-w-sm"
                            style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        />
                    ) : (
                        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            {displayUser.fullName}
                        </h1>
                    )}

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-widest uppercase mb-8">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        Clearance: {displayUser.role.toUpperCase()}
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>REGISTERED SIGNAL (EMAIL)</div>
                            <div className="text-sm text-slate-200" style={{ fontFamily: "monospace" }}>{displayUser.email}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>AGENT IDENTIFIER ID</div>
                            <div className="text-sm text-slate-200" style={{ fontFamily: "monospace" }}>{displayUser._id || "AWAITING_GEN"}</div>
                        </div>
                    </div>

                    {/* Location Info Grid */}
                    <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>LOCALITY</div>
                            {isEditing ? (
                                <input type="text" value={editData.locality} onChange={(e) => setEditData({...editData, locality: e.target.value})} className="w-full bg-black/60 border border-teal-500/40 text-teal-400 text-sm px-2 py-1 rounded focus:outline-none focus:border-teal-400 font-mono" />
                            ) : (
                                <div className="text-sm text-slate-200" style={{ fontFamily: "monospace" }}>{displayUser.locality || "-"}</div>
                            )}
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>DISTRICT</div>
                            {isEditing ? (
                                <input type="text" value={editData.district} onChange={(e) => setEditData({...editData, district: e.target.value})} className="w-full bg-black/60 border border-teal-500/40 text-teal-400 text-sm px-2 py-1 rounded focus:outline-none focus:border-teal-400 font-mono" />
                            ) : (
                                <div className="text-sm text-slate-200" style={{ fontFamily: "monospace" }}>{displayUser.district || "-"}</div>
                            )}
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>STATE</div>
                            {isEditing ? (
                                <input type="text" value={editData.state} onChange={(e) => setEditData({...editData, state: e.target.value})} className="w-full bg-black/60 border border-teal-500/40 text-teal-400 text-sm px-2 py-1 rounded focus:outline-none focus:border-teal-400 font-mono" />
                            ) : (
                                <div className="text-sm text-slate-200" style={{ fontFamily: "monospace" }}>{displayUser.state || "-"}</div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="w-full mt-6 flex justify-center gap-4">
                            <button onClick={() => {setIsEditing(false); setEditData({ fullName: displayUser.fullName || "", locality: displayUser.locality || "", district: displayUser.district || "", state: displayUser.state || "" });}} disabled={saving} className="px-6 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>CANCEL</button>
                            <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors text-xs font-bold tracking-widest uppercase flex items-center gap-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                {saving ? <span className="animate-spin inline-block">⏳</span> : null}
                                SAVE CHANGES
                            </button>
                        </div>
                    )}

                </div>

            </div>

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
