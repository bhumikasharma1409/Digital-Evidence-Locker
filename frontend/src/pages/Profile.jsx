import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
    const [updateLoading, setUpdateLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        locality: "",
        district: "",
        state: ""
    });

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
                    setFormData({
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async () => {
        setUpdateLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            
            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                setUser(data);
                setIsEditing(false);
            } else {
                setError(data.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Network error. Could not save changes.");
        } finally {
            setUpdateLoading(false);
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
    const displayUser = user || { fullName: "UNKNOWN AGENT", email: "REDACTED", role: "user" };

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
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    handleUpdateProfile();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            disabled={updateLoading}
                            className={`px-4 py-2 rounded-lg border ${isEditing ? 'border-teal-500/30 text-teal-400 hover:bg-teal-500/10' : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'} transition-colors text-xs font-bold tracking-widest uppercase`}
                            style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                            {updateLoading ? "SAVING..." : isEditing ? "SAVE CHANGES" : "EDIT PROFILE"}
                        </button>

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
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="text-3xl font-black text-white text-center bg-black/40 border border-teal-500/40 rounded-xl px-4 py-2 mb-2 focus:outline-none focus:border-teal-400"
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
                        
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-left md:col-span-2">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>LOCATION DATA</div>
                            
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                    <div>
                                        <label className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Locality</label>
                                        <input type="text" name="locality" value={formData.locality} onChange={handleChange} className="w-full mt-1 bg-black/40 border border-teal-500/30 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-400 capitalize" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">District</label>
                                        <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full mt-1 bg-black/40 border border-teal-500/30 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-400 capitalize" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">State / Region</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full mt-1 bg-black/40 border border-teal-500/30 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-400 capitalize" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="text-sm text-slate-300 capitalize"><span className="text-slate-500 font-mono text-xs mr-1">Locality:</span> {displayUser.locality || "UNSPECIFIED"}</div>
                                    <div className="text-sm text-slate-300 capitalize"><span className="text-slate-500 font-mono text-xs mr-1">District:</span> {displayUser.district || "UNSPECIFIED"}</div>
                                    <div className="text-sm text-slate-300 capitalize"><span className="text-slate-500 font-mono text-xs mr-1">State:</span> {displayUser.state || "UNSPECIFIED"}</div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
