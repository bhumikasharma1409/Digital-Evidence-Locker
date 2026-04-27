import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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
        const chars = "01░▒▓█ABCDEF0123456789".split("");
        let frame;
        const draw = () => {
            ctx.fillStyle = "rgba(10,15,26,0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "13px monospace";
            drops.forEach((y, i) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const alpha = Math.random() > 0.92 ? 1 : 0.18;
                ctx.fillStyle = `rgba(59,130,246,${alpha})`; // Blue for Police
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

export default function PoliceLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerError("");
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    expectedRole: "police"
                }),
            });
            const data = await response.json();
            if (response.ok || data.success) {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    if (data.role) localStorage.setItem("role", data.role);
                }
                navigate("/police-dashboard");
            } else {
                setServerError(data.message || "Invalid credentials");
            }
        } catch (err) {
            setServerError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-hidden relative flex items-center justify-center p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <MatrixRain />
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl border" style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(59,130,246,0.3)",
                boxShadow: "0 0 30px rgba(59,130,246,0.1)",
            }}>
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-3xl font-black text-white text-center" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        Police <span className="text-blue-400">Dispatch</span>
                    </h2>
                </div>
                {serverError && <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold text-center">{serverError}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">BADGE EMAIL</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none bg-black/40 border border-blue-500/30 focus:border-blue-400 text-blue-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">SECURITY KEY</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none bg-black/40 border border-blue-500/30 focus:border-blue-400 text-blue-400" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full mt-6 py-4 rounded-xl flex justify-center items-center font-bold tracking-widest uppercase transition-all duration-300 bg-blue-500/10 border border-blue-500/40 text-blue-400 hover:bg-blue-500/20">
                        {loading ? "AUTHENTICATING..." : "AUTHORIZE DISPATCH"}
                    </button>
                </form>
            </div>
        </div>
    );
}
