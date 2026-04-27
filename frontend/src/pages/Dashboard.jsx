import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserDashboard from "./UserDashboard";
import PoliceDashboard from "./PoliceDashboard";
import LawyerDashboard from "./LawyerDashboard";
import AdminDashboard from "./AdminDashboard";

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

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return navigate("/login");

                const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.success) {
                    setUser(response.data);
                } else {
                    throw new Error("Failed to load user profile");
                }
            } catch (err) {
                console.error("Dashboard router auth error:", err);
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

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

    if (error || !user) {
        return <div className="min-h-screen bg-[#0a0f1a] text-red-500 flex justify-center items-center font-mono">ERROR ROUTING</div>;
    }

    const renderDashboard = () => {
        switch (user.role) {
            case "police":
                return <PoliceDashboard user={user} />;
            case "lawyer":
                return <LawyerDashboard user={user} />;
            case "admin":
                return <AdminDashboard user={user} />;
            case "user":
            default:
                return <UserDashboard user={user} />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden relative flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
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
            
            {/* The role-specific sub-dashboard component handles the content within the Matrix overlay */}
            <div className="w-full h-full relative z-10" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
                {renderDashboard()}
            </div>
        </div>
    );
}
