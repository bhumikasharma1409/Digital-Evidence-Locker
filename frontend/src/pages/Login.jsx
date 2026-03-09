import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// --- Matrix Rain Canvas (Reused for consistent theme) ---
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
        const chars = "01░▒▓█ABCDEF0123456789".split("");
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

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for the specific field when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
        setServerError("");
    };

    const validateForm = () => {
        const newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setServerError("");
        try {
            // Modify URL depending on your actual API endpoint for login
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok || data.success) {
                // Save token to localStorage
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                // Redirect to dashboard page
                navigate("/dashboard");
            } else {
                setServerError(data.message || "Invalid email or password");
            }
        } catch (err) {
            console.error("Login error:", err);
            setServerError("Network error. Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-hidden relative flex items-center justify-center p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <style>{`
          @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
          @keyframes gridScroll{from{background-position:0 0}to{background-position:0 40px}}
          .grid-bg{background-image:linear-gradient(rgba(20,210,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,210,160,0.04) 1px,transparent 1px);background-size:40px 40px;animation:gridScroll 8s linear infinite;}
          @keyframes scanline{0%{transform:translateY(-5%)}100%{transform:translateY(105vh)}}
          .scanline{pointer-events:none;position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(20,210,160,0.06),transparent);animation:scanline 8s linear infinite;z-index:999;}
      `}</style>

            {/* Background Effects */}
            <div className="scanline" />
            <div className="absolute inset-0 grid-bg opacity-60" />
            <MatrixRain />
            <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border" style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(20,210,160,0.3)",
                boxShadow: "0 0 30px rgba(20,210,160,0.1)",
                animation: "fadeSlideUp 0.8s ease both"
            }}>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{
                        background: "linear-gradient(135deg,rgba(20,210,160,0.2),rgba(59,130,246,0.2))",
                        border: "1px solid rgba(20,210,160,0.4)",
                        boxShadow: "0 0 20px rgba(20,210,160,0.2)"
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <div className="text-sm text-teal-400 font-black uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        ── SYSTEM ACCESS ──
                    </div>
                    <h2 className="text-3xl font-black text-white text-center" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        System <span className="text-teal-400">Login</span>
                    </h2>
                </div>

                {serverError && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 tracking-widest mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="agent@directive.gov"
                            className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-600 focus:ring-1 ${errors.email ? "border-red-500/50 focus:ring-red-500/50" : "border-teal-500/30 focus:ring-teal-400/50"}`}
                            style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(20,210,160,0.3)'}`, color: "#14d2a0", fontFamily: "'Share Tech Mono', monospace" }}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-400 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                SECURITY KEY
                            </label>
                            <span className="text-xs text-slate-500 hover:text-teal-400 cursor-pointer transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                FORGOT KEY?
                            </span>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-600 focus:ring-1 ${errors.password ? "border-red-500/50 focus:ring-red-500/50" : "border-teal-500/30 focus:ring-teal-400/50"}`}
                            style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(20,210,160,0.3)'}`, color: "#14d2a0", fontFamily: "'Share Tech Mono', monospace" }}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-4 rounded-xl flex justify-center items-center gap-2 text-sm font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                        style={{
                            background: loading ? "rgba(20,210,160,0.2)" : "rgba(20,210,160,0.15)",
                            border: "1px solid rgba(20,210,160,0.4)",
                            color: "#14d2a0",
                            boxShadow: "0 0 15px rgba(20,210,160,0.15)",
                            fontFamily: "'Share Tech Mono', monospace"
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>AUTHENTICATING...</span>
                            </>
                        ) : (
                            <span>AUTHENTICATE</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    <p className="text-slate-500 text-sm">
                        DON'T HAVE AN ACCOUNT?{" "}
                        <Link to="/register" className="text-teal-400 hover:text-teal-300 transition-colors ml-2 font-bold hover:underline underline-offset-4">
                            REGISTER HERE
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
