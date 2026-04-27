/**
 * Dashboard.jsx: Overview page for citizens to see their case statistics and recent activity.
 * Connected to the navigation bar and allows navigation to Case Details and Create Case.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

// --- Stat Card ---
function StatCard({ label, value, colorClass, icon }) {
    return (
        <div className="relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] overflow-hidden" style={{
            background: "rgba(0,0,0,0.4)",
            borderColor: "rgba(20,210,160,0.2)"
        }}>
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, rgba(20,210,160,0.05), transparent 70%)` }} />
            <div className="text-3xl mb-3">{icon}</div>
            <div className={`text-4xl font-black mb-1 ${colorClass}`} style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {value}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">{label}</div>
        </div>
    );
}

// --- Hex Badge ---
function HexBadge({ label, color = "teal" }) {
    const colors = {
        teal: { bg: "rgba(20,210,160,0.1)", border: "rgba(20,210,160,0.3)", text: "#14d2a0", dot: "bg-teal-400" },
        yellow: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", dot: "bg-yellow-400" },
        blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#3b82f6", dot: "bg-blue-400" },
        purple: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#a855f7", dot: "bg-purple-400" },
        green: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", dot: "bg-green-400" },
        red: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", dot: "bg-red-400" },
    };
    const c = colors[color] || colors.teal;

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.text
        }}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
            {label}
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("user");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const API_URL = `${API_BASE_URL}/api/cases`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                setLoading(true);

                // Fetch User Profile
                try {
                    const profileRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (profileRes.data && profileRes.data.fullName) {
                        setUserName(profileRes.data.fullName);
                        setUserRole(profileRes.data.role);
                    }
                } catch (profErr) {
                    console.error("Failed to fetch user profile name:", profErr);
                    // Silently fail for just the user name if desired, or handle it as needed.
                }

                // Fetch Cases
                const response = await axios.get(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setCases(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                if (err.response && err.response.status === 401) {
                    // Unauthorized, logic dictates clearing local storage and force login link
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setError("Unable to load dashboard data");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTakeOwnership = async (e, caseId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.patch(`${API_URL}/${caseId}/assign-police`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                // Update local case state
                setCases(prev => prev.map(c => 
                    c._id === caseId ? { ...c, assignedPolice: { _id: response.data.data.assignedPolice, fullName: userName }, status: "Under Investigation" } : c
                ));
            }
        } catch (err) {
            console.error("Failed to take ownership:", err);
            alert("Failed to take ownership: " + (err.response?.data?.message || err.message));
        }
    };

    // Stats Calculation
    const totalCases = cases.length;
    const closedCases = cases.filter(c => c.status === "CLOSED").length;
    const activeCases = totalCases - closedCases;

    // Recent 4 Cases
    const recentCases = [...cases]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    const unclaimedCases = cases.filter(c => !c.assignedPolice);
    const claimedCases = cases.filter(c => c.assignedPolice);

    const statusColors = {
        PENDING: "yellow",
        ASSIGNED: "blue",
        VERIFIED: "purple",
        CLOSED: "red",
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center text-teal-400 font-mono">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-teal-500/20 border-t-teal-400 rounded-full animate-spin" />
                    <span>SYNCHRONIZING_DIRECTORY...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#0a0f1a] flex items-center justify-center text-red-500 font-mono text-center p-6">
                <div className="max-w-md p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">ERROR_TERMINATED</h2>
                    <p className="text-sm opacity-80 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all">Retry Link</button>
                </div>
            </div>
        );
    }

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

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-1" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
                    <div className="text-xs text-teal-400 font-black uppercase tracking-[0.4em] mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        ── DIRECTORY ACCESS ──
                    </div>
                    <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        Welcome, <span className="text-teal-400">{userName || "Agent"}</span>
                    </h1>
                    <p className="text-slate-400 text-sm tracking-wide">Secure Digital Evidence Locker Overview</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.1s both" }}>
                    <StatCard label="Total Cases" value={totalCases} colorClass="text-teal-400" icon="📁" />
                    <StatCard label="Active" value={activeCases} colorClass="text-blue-400" icon="👁️" />
                    <StatCard label="Closed" value={closedCases} colorClass="text-slate-500" icon="🔒" />
                </div>

                {/* Create Case Button - Only for Normal Users */}
                {userRole === "user" && (
                    <div className="mb-14" style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}>
                        <button
                            onClick={() => navigate("/create-case")}
                            className="w-full py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-3 group overflow-hidden relative"
                            style={{ border: "1px solid rgba(20,210,160,0.4)", background: "rgba(20,210,160,0.1)", color: "#14d2a0" }}
                        >
                            <div className="absolute inset-0 bg-teal-400/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
                            <span>CREATE NEW CASE</span>
                        </button>
                    </div>
                )}

                {/* Cases Section */}
                {userRole === "police" ? (
                    <>
                        {/* Unclaimed Cases */}
                        <div className="mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.3s both" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-yellow-400 tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>🟡 Unclaimed Cases</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {unclaimedCases.length > 0 ? unclaimedCases.map((c, i) => (
                                    <div
                                        key={c._id}
                                        onClick={() => navigate(`/case/${c._id}`)}
                                        className="p-5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer group flex items-center justify-between"
                                        style={{ background: "rgba(234,179,8,0.05)" }}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-slate-100 group-hover:text-yellow-400 transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{c.title}</h3>
                                                <HexBadge label={c.status} color={statusColors[c.status] || "teal"} />
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono tracking-widest mt-1">
                                                <span>ID_{c._id.slice(-6).toUpperCase()}</span>
                                                <span>LOGGED_{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={(e) => handleTakeOwnership(e, c._id)}
                                                className="px-3 py-1.5 rounded-lg border border-teal-500/40 text-teal-400 text-[10px] uppercase font-bold tracking-widest hover:bg-teal-500/10 z-10"
                                            >
                                                Take Ownership
                                            </button>
                                            <div className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center rounded-2xl border border-dashed border-white/10 opacity-50 flex flex-col items-center gap-3">
                                        <span className="text-xs font-mono tracking-widest uppercase">No unclaimed cases in district.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Claimed Cases */}
                        <div className="mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.4s both" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-blue-400 tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>🔵 Claimed Cases</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {claimedCases.length > 0 ? claimedCases.map((c, i) => (
                                    <div
                                        key={c._id}
                                        onClick={() => navigate(`/case/${c._id}`)}
                                        className="p-5 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group flex items-center justify-between"
                                        style={{ background: "rgba(59,130,246,0.05)" }}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{c.title}</h3>
                                                <HexBadge label={c.status} color={statusColors[c.status] || "teal"} />
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono tracking-widest mt-1">
                                                <span>ID_{c._id.slice(-6).toUpperCase()}</span>
                                                <span>LOGGED_{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-[10px] text-blue-400 font-bold tracking-widest mt-1">
                                                Assigned to: {c.assignedPolice.fullName}
                                            </div>
                                        </div>
                                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center rounded-2xl border border-dashed border-white/10 opacity-50 flex flex-col items-center gap-3">
                                        <span className="text-xs font-mono tracking-widest uppercase">No claimed cases found.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.3s both" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Recent Cases</h2>
                            <button onClick={() => navigate("/my-cases")} className="text-xs text-teal-400 hover:text-teal-300 font-bold tracking-widest uppercase">View All →</button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {recentCases.length > 0 ? recentCases.map((c, i) => (
                                <div
                                    key={c._id}
                                    onClick={() => navigate(`/case/${c._id}`)}
                                    className="p-5 rounded-xl border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer group flex items-center justify-between"
                                    style={{ background: "rgba(255,255,255,0.02)" }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-slate-100 group-hover:text-teal-400 transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{c.title}</h3>
                                            <HexBadge label={c.status} color={statusColors[c.status] || "teal"} />
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono tracking-widest mt-1">
                                            <span>ID_{c._id.slice(-6).toUpperCase()}</span>
                                            <span>LOGGED_{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {c.assignedPolice && (
                                            <div className="text-[10px] text-blue-400 font-bold tracking-widest mt-1">
                                                Assigned to: {c.assignedPolice.fullName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                                </div>
                            )) : (
                                <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 opacity-50 flex flex-col items-center gap-3">
                                    <span className="text-2xl">📭</span>
                                    <span className="text-xs font-mono tracking-widest uppercase">No cases detected in repository</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Info Card */}
                <div className="p-8 rounded-2xl border border-blue-500/20 text-center relative overflow-hidden" style={{ background: "rgba(59,130,246,0.05)", animation: "fadeSlideUp 0.8s ease 0.4s both" }}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/40" />
                    <div className="text-2xl mb-3">🛡️</div>
                    <h3 className="text-white font-bold mb-2 tracking-widest uppercase" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Secured by Chain-of-Custody</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
                        All evidence submitted is cryptographically hashed and stored securely.
                        Every modification is signed and verified across our forensic distributed ledger.
                    </p>
                </div>

            </div>
        </div>
    );
}
