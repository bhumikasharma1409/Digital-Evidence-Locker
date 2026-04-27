import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket, connectSocket } from "../socket";

export default function AdminDashboard({ user }) {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE_URL}/api/dashboard/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        connectSocket(user);

        const handleRefresh = () => fetchDashboard();
        
        socket.on("evidence_uploaded", handleRefresh);
        socket.on("access_request_created", handleRefresh);

        return () => {
            socket.off("evidence_uploaded", handleRefresh);
            socket.off("access_request_created", handleRefresh);
        };
    }, []);

    if (loading) return <div className="text-red-500 p-8 font-mono">ESTABLISHING OMNI DIRECTORY CONNECTION...</div>;

    const { systemStats, recentEvidence, users } = data;

    return (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-32 font-mono">
            <h1 className="text-3xl font-black text-white mb-2">OVERSEER // <span className="text-red-500">{user.fullName}</span></h1>
            <div className="text-xs text-red-500/80 tracking-widest mb-8 border-b border-red-500/20 pb-4">
                GOD MODE ENABLED
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-center">
                    <div className="text-3xl text-red-500 font-bold">{systemStats.totalEvidence}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">TOTAL EVIDENCE</div>
                </div>
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-center">
                    <div className="text-3xl text-red-500 font-bold">{systemStats.totalCases}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">TOTAL CASES</div>
                </div>
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-center">
                    <div className="text-3xl text-red-500 font-bold">{systemStats.totalUsers}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">REGISTERED AGENTS</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl text-white mb-4 bg-red-500/10 inline-block px-4 py-2 border border-red-500/30 rounded">GLOBAL EVIDENCE FEED</h2>
                    <div className="space-y-3 h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {recentEvidence.map(ev => (
                            <div key={ev._id} className="p-4 border border-red-500/20 bg-black/60 rounded flex justify-between items-center cursor-pointer hover:border-red-500/60" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                                <div>
                                    <div className="text-red-400 text-xs font-bold">{ev.originalName}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Uploader: {ev.uploadedBy?.fullName} | Locality: {ev.locality || 'None'}</div>
                                </div>
                                <div className="text-[10px] uppercase text-red-500/80">{ev.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl text-white mb-4 bg-red-500/10 inline-block px-4 py-2 border border-red-500/30 rounded">USERS DIRECTORY</h2>
                    <div className="space-y-3 h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {users.map(u => (
                            <div key={u._id} className="p-3 border border-white/10 bg-white/5 rounded flex justify-between items-center">
                                <div>
                                    <div className="text-slate-200 text-xs font-bold">{u.fullName}</div>
                                    <div className="text-[10px] text-slate-500 mt-1">{u.email} | {u.locality || 'Global'}</div>
                                </div>
                                <div className="text-[10px] uppercase bg-white/10 px-2 py-1 rounded text-slate-300">{u.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
