/**
 * CreateCase.jsx: Form page for citizens to register a new evidence case.
 * Once submitted, it redirects the user to the My Cases or Dashboard page.
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
    };
    const c = colors[color] || colors.teal;

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.text
        }}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
            {label}
        </div>
    );
}

export default function CreateCase() {
    const navigate = useNavigate();

    // Protect route on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const [formData, setFormData] = useState({
        title: "",
        category: "Phishing",
        description: "",
    });
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.title || !formData.category || !formData.description) {
            setError("PROTOCOL_ERROR: missing required fields.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const data = new FormData();
            data.append("title", formData.title);
            data.append("category", formData.category);
            data.append("description", formData.description);
            if (evidenceFile) {
                data.append("evidenceFile", evidenceFile);
            }

            await axios.post("http://localhost:5001/api/cases", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // FormData boundary will be set automatically by axios
                }
            });

            setSuccess("SUCCESS: Case securely anchored to system.");
            setTimeout(() => {
                navigate("/my-cases");
            }, 1500);
        } catch (err) {
            console.error("Error submitting case:", err);

            // Handle specific unauthorized cases
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                setError("Session expired, please login again");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            setError(err.response?.data?.message || err.message || "UPLOAD_FAILED: Integrity check error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden relative" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <style>{`
              @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
              @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(20,210,160,0.3),0 0 40px rgba(20,210,160,0.1)}50%{box-shadow:0 0 50px rgba(20,210,160,0.6),0 0 100px rgba(20,210,160,0.2)}}
              @keyframes gridScroll{from{background-position:0 0}to{background-position:0 40px}}
              .grid-bg{background-image:linear-gradient(rgba(20,210,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,210,160,0.04) 1px,transparent 1px);background-size:40px 40px;animation:gridScroll 8s linear infinite;}
              @keyframes scanline{0%{transform:translateY(-5%)}100%{transform:translateY(105vh)}}
              .scanline{pointer-events:none;position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(20,210,160,0.06),transparent);animation:scanline 8s linear infinite;z-index:999;}
            `}</style>

            {/* Scanline effect */}
            <div className="scanline" />
            <div className="absolute inset-0 grid-bg opacity-60" />
            <MatrixRain />
            <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />

            <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto" style={{ animation: "fadeSlideUp 0.8s ease both" }}>

                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center glow-btn mb-6" style={{
                            background: "linear-gradient(135deg,rgba(20,210,160,0.2),rgba(59,130,246,0.2))",
                            border: "1px solid rgba(20,210,160,0.4)"
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <div className="text-sm text-teal-400 font-black uppercase tracking-[0.3em] mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            ── INGEST PROTOCOL ──
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            Submit <span className="text-teal-400">Evidence</span>
                        </h1>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest" style={{
                            background: "rgba(20,210,160,0.1)", border: "1px solid rgba(20,210,160,0.3)", color: "#14d2a0", fontFamily: "'Share Tech Mono', monospace"
                        }}>
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            AES-256 Encryption Active
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden transition-all duration-300"
                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(20,210,160,0.3)", animation: "fadeSlideUp 0.8s ease 0.2s both" }}
                    >
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(20,210,160,0.3), transparent 70%)" }} />

                        {error && (
                            <div className="mb-6 p-4 rounded-xl text-sm break-words flex items-center gap-3 relative overflow-hidden" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", fontFamily: "'Share Tech Mono', monospace" }}>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 rounded-xl text-sm break-words flex items-center gap-3 relative overflow-hidden" style={{ background: "rgba(20,210,160,0.1)", border: "1px solid rgba(20,210,160,0.4)", color: "#14d2a0", fontFamily: "'Share Tech Mono', monospace" }}>
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
                                <span>✓</span> {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    Case Designation <span className="text-teal-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400/50 transition-all"
                                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(20,210,160,0.2)", fontFamily: "'Share Tech Mono', monospace" }}
                                    placeholder="e.g. OPERATION_PHANTOM"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    Threat Vector <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-teal-400/50 transition-all appearance-none cursor-pointer"
                                        style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(20,210,160,0.2)", fontFamily: "'Share Tech Mono', monospace" }}
                                        required
                                    >
                                        <option className="bg-[#0b1220] text-white" value="Phishing">Phishing</option>
                                        <option className="bg-[#0b1220] text-white" value="Malware">Malware</option>
                                        <option className="bg-[#0b1220] text-white" value="Unauthorized Access">Unauthorized Access</option>
                                        <option className="bg-[#0b1220] text-white" value="Fraud">Fraud</option>
                                        <option className="bg-[#0b1220] text-white" value="Other">Other</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-teal-500">
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    Incident Report <span className="text-teal-400">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-400/50 transition-all resize-none"
                                    style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(20,210,160,0.2)", fontFamily: "'Share Tech Mono', monospace" }}
                                    placeholder="Enter detailed cryptographic logs, timelines, or context..."
                                    required
                                />
                            </div>

                            {/* Upload Evidence */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    Digital Evidence Upload
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer group"
                                    style={{ borderColor: "rgba(20,210,160,0.3)", background: "rgba(0,0,0,0.4)" }}>
                                    <div className="space-y-2 text-center relative">
                                        <svg
                                            className="mx-auto h-12 w-12 text-teal-500/50 group-hover:text-teal-400 transition-colors"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex justify-center text-sm">
                                            <label
                                                htmlFor="evidenceFile"
                                                className="relative cursor-pointer rounded-md font-bold text-teal-400 hover:text-teal-300 focus-within:outline-none"
                                                style={{ fontFamily: "'Share Tech Mono', monospace" }}
                                            >
                                                <span>SELECT SECURE FILE</span>
                                                <input
                                                    id="evidenceFile"
                                                    name="evidenceFile"
                                                    type="file"
                                                    accept="image/*,video/*,application/pdf"
                                                    className="sr-only"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            <p className="pl-2 text-slate-400">or drop into vault</p>
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono">
                                            PNG, JPG, MP4, PDF (MAX 50MB)
                                        </p>
                                        {evidenceFile && (
                                            <div className="mt-3">
                                                <HexBadge label={evidenceFile.name} color="teal" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center py-4 px-4 rounded-xl font-black text-sm tracking-widest transition-all duration-300 ${loading ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.02] glow-btn"}`}
                                    style={{ background: "linear-gradient(135deg,#14d2a0,#0ea5e9)", color: "#0a0f1a", fontFamily: "'Share Tech Mono', monospace", textTransform: "uppercase" }}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-3">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            ENCRYPTING & UPLOADING...
                                        </span>
                                    ) : (
                                        "⚡ INITIATE SECURE TRANSFER"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
