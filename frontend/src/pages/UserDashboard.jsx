import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket, connectSocket } from "../socket";

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
        const chars = "01아이ウエオカキクケコ░▒▓█ABCDEF012345".split("");
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

export default function UserDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const fetchDashboardAndUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const profileRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(profileRes.data);

            const dashRes = await axios.get(`${API_BASE_URL}/api/dashboard/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(dashRes.data.data);
            connectSocket(profileRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardAndUser();
        
        const handleRefresh = () => {
             // simplified refetch upon socket hit
        };

        socket.on("evidence_status_updated", handleRefresh);
        socket.on("access_request_created", handleRefresh);
        socket.on("access_request_updated", handleRefresh);

        return () => {
            socket.off("evidence_status_updated", handleRefresh);
            socket.off("access_request_created", handleRefresh);
            socket.off("access_request_updated", handleRefresh);
        };
    }, []);

    if (loading) return <div className="text-teal-400 p-8">SYNCING USER DIRECTORY...</div>;

    const { myEvidence, sharedEvidence, statusCounts } = data;

    return (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-32 font-mono">
            <h1 className="text-3xl font-black text-white mb-6">User Interface // <span className="text-teal-400">{user.fullName}</span></h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 border border-teal-500/30 bg-teal-500/10 rounded-xl text-center">
                    <div className="text-2xl text-teal-400 font-bold">{statusCounts.verified}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-1">VERIFIED</div>
                </div>
                <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-xl text-center">
                    <div className="text-2xl text-yellow-400 font-bold">{statusCounts.pending}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-1">PENDING</div>
                </div>
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-center">
                    <div className="text-2xl text-red-500 font-bold">{statusCounts.rejected}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-1">REJECTED</div>
                </div>
                <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-xl text-center">
                    <div className="text-2xl text-blue-400 font-bold">{sharedEvidence.length}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-1">SHARED WITH ME</div>
                </div>
            </div>

            <button onClick={() => navigate("/create-case")} className="w-full mb-8 py-4 border border-teal-500/50 hover:bg-teal-500/20 text-teal-400 transition-colors uppercase tracking-[0.2em] font-bold">
                + UPLOAD NEW EVIDENCE / CASE
            </button>

            <h2 className="text-xl text-white mb-4">MY UPLOADS</h2>
            <div className="space-y-3 mb-8">
                {myEvidence.map(ev => (
                    <div key={ev._id} className="p-4 border border-white/10 bg-black/40 rounded-lg flex justify-between items-center hover:border-teal-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                        <div>
                            <div className="text-teal-400 text-sm">{ev.originalName}</div>
                            <div className="text-xs text-slate-500 mt-1">Status: {ev.status.toUpperCase()}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded">
                            {ev.accessRequests.filter(r => r.status === 'pending').length} PENDING REQUESTS
                        </div>
                    </div>
                ))}
                {myEvidence.length === 0 && <div className="text-slate-500 text-sm">No evidence uploaded yet.</div>}
            </div>

            <h2 className="text-xl text-white mb-4">SHARED WITH ME</h2>
            <div className="space-y-3">
                {sharedEvidence.map(ev => (
                    <div key={ev._id} className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg flex justify-between items-center hover:border-blue-500/40 cursor-pointer" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                        <div>
                            <div className="text-blue-400 text-sm">{ev.originalName}</div>
                            <div className="text-xs text-slate-500 mt-1">By: {ev.uploadedBy?.fullName}</div>
                        </div>
                        <div className="text-[10px] text-slate-400">
                            VIEW ONLY
                        </div>
                    </div>
                ))}
                {sharedEvidence.length === 0 && <div className="text-slate-500 text-sm">No shared evidence.</div>}
            </div>
        </div>
    );
}
