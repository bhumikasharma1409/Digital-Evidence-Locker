/**
 * CaseDetails.jsx: Detailed view of a specific evidence case, showing files, status, and activity logs.
 * Accessed by clicking a case in the Dashboard or My Cases pages.
 */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    const SERVER_URL = "http://localhost:5001/";
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

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseData = async () => {
            if (!id || id === ":id") {
                setError("Invalid Case ID provided in the URL directory.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5001/api/cases/${id}`);
                setCaseData(response.data.data);
            } catch (err) {
                console.error("Error fetching case details:", err.response || err);
                setError(err.response?.data?.message || err.message || "Unable to load case details. Connection securely terminated.");
            } finally {
                setLoading(false);
            }
        };

        fetchCaseData();
    }, [id]);

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
        createdAt
    } = caseData;

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

                {/* Back Button */}
                <button onClick={() => navigate('/my-cases')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-mono text-xs uppercase tracking-widest" style={{ animation: "fadeSlideUp 0.6s ease both" }}>
                    <span>←</span> BACK TO DIRECTORY
                </button>

                {/* HEADER SECTION */}
                <div className="mb-12" style={{ animation: "fadeSlideUp 0.6s ease 0.1s both" }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <HexBadge label={status || "Under Investigation"} color="teal" />
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400">
                                    ID: {id}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                <GlitchText text={title} />
                            </h1>
                        </div>

                        <div className="md:text-right p-4 rounded-xl bg-black/40 border border-teal-500/20 shadow-[0_0_15px_rgba(20,210,160,0.05)]">
                            <div className="text-xs text-slate-500 font-bold tracking-widest mb-1 font-mono">ASSIGNED AGENT</div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs">
                                    👁️
                                </div>
                                <div className="text-sm text-slate-200 font-mono">Agent-X7 (Automated)</div>
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
                                    <dd className="text-sm text-slate-300 font-mono text-teal-400">Recently verified</dd>
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
                                {activityLog && activityLog.length > 0 ? (
                                    activityLog.map((log, index) => (
                                        <div key={index} className="pl-4 relative">
                                            <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                            <div className="text-xs text-slate-400 font-mono mb-1">System automated entry</div>
                                            <div className="text-sm text-slate-200 font-mono font-bold leading-tight relative inline-block">
                                                {log}
                                            </div>
                                        </div>
                                    ))
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
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                                {description}
                            </p>
                        </div>

                        {/* EVIDENCE LOCKER SECTION */}
                        <div className="rounded-2xl border border-teal-500/20 bg-[#06101c]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_40px_rgba(20,210,160,0.05)] relative" style={{ animation: "fadeSlideUp 0.6s ease 0.5s both" }}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50" />

                            <div className="p-6 md:p-8">
                                <div className="flex flex-wrap items-end justify-between gap-4 mb-8 border-b border-teal-500/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-teal-500/40 bg-teal-500/10 shadow-[0_0_15px_rgba(20,210,160,0.15)] text-teal-400">
                                            🗄️
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Evidence Vault</h2>
                                            <div className="text-xs text-teal-500 tracking-widest font-mono uppercase">Cryptographic Seal Intact</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-slate-800 text-xs font-mono text-slate-400">
                                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_5px_#14d2a0]" />
                                        {evidenceFile ? "1 ITEM SEALED" : "NO EVIDENCE FOUND"}
                                    </div>
                                </div>

                                {evidenceFile ? (
                                    <div className="space-y-6">

                                        {/* File Card Preview */}
                                        {renderEvidenceFile(evidenceFile)}

                                        {/* Cryptographic Proof Metadata */}
                                        <div className="p-5 rounded-xl border border-slate-700 bg-black/50 space-y-3 font-mono">
                                            <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-wider">File Origin</span>
                                                <span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs block">{evidenceFile.split('/').pop() || evidenceFile.split('\\').pop() || evidenceFile}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-wider">Extraction Date</span>
                                                <span className="text-slate-300">{new Date(createdAt).toLocaleString()}</span>
                                            </div>

                                            <div className="h-px w-full bg-slate-800" />

                                            <div className="flex justify-between items-center text-xs mt-2">
                                                <span className="text-teal-500/70 font-bold uppercase tracking-wider">SHA-256 Digest</span>
                                                <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 px-2 py-1 rounded border border-teal-500/20 truncate max-w-[200px] sm:max-w-md ml-2 select-all">
                                                    {hash || "HASH_COMPUTATION_PENDING..."}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-xl bg-black/20">
                                        <div className="text-4xl opacity-40 mb-3 block">📭</div>
                                        <h3 className="text-slate-300 font-bold font-mono tracking-widest text-sm mb-1">VAULT EMPTY</h3>
                                        <p className="text-xs text-slate-500 font-mono">No cryptographic evidence objects located for this case.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
