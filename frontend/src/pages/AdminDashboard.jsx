import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket, connectSocket } from "../socket";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formPolice, setFormPolice] = useState({ fullName: "", email: "", password: "", locality: "", district: "", state: "" });
    const [formLawyer, setFormLawyer] = useState({ fullName: "", email: "", password: "", locality: "", district: "", state: "" });
    const [message, setMessage] = useState({ text: "", type: "" });

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const fetchDashboardAndUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const profileRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(profileRes.data);

            const dashRes = await axios.get(`${API_BASE_URL}/api/dashboard/admin`, {
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
        const handleRefresh = () => fetchDashboardAndUser();
        socket.on("evidence_uploaded", handleRefresh);
        socket.on("access_request_created", handleRefresh);
        return () => {
            socket.off("evidence_uploaded", handleRefresh);
            socket.off("access_request_created", handleRefresh);
        };
    }, []);

    const handleCreateAccount = async (e, role, formState, setFormState) => {
        e.preventDefault();
        setMessage({ text: "PROVISIONING...", type: "info" });
        try {
            const token = localStorage.getItem("token");
            const endpoint = role === 'police' ? '/api/auth/admin/create-police' : '/api/auth/admin/create-lawyer';
            const res = await axios.post(`${API_BASE_URL}${endpoint}`, formState, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessage({ text: `${role.toUpperCase()} AGENT CREATED SUCCESSFULLY`, type: "success" });
                setFormState({ fullName: "", email: "", password: "", locality: "", district: "", state: "" });
                fetchDashboardAndUser(); // refresh user list
            }
        } catch (err) {
            setMessage({ text: err.response?.data?.message || "CREATION FAILED", type: "error" });
        }
    };

    if (loading) return <div className="text-red-500 p-8 font-mono">ESTABLISHING OMNI DIRECTORY CONNECTION...</div>;

    const { systemStats, recentEvidence, users } = data;

    return (
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-12 pb-32 font-mono">
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

            {message.text && (
                <div className={`mb-6 p-4 border rounded text-xs font-bold text-center uppercase tracking-widest ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 border border-red-500/30 bg-black/40 rounded-xl">
                    <h2 className="text-lg text-red-400 mb-4 tracking-widest">PROVISION POLICE AGENT</h2>
                    <form onSubmit={(e) => handleCreateAccount(e, 'police', formPolice, setFormPolice)} className="space-y-3">
                        <input type="text" placeholder="Full Name" value={formPolice.fullName} onChange={(e) => setFormPolice({...formPolice, fullName: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                        <input type="email" placeholder="Badge Email" value={formPolice.email} onChange={(e) => setFormPolice({...formPolice, email: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                        <input type="password" placeholder="Passkey" value={formPolice.password} onChange={(e) => setFormPolice({...formPolice, password: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="State" value={formPolice.state} onChange={(e) => setFormPolice({...formPolice, state: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                            <input type="text" placeholder="District" value={formPolice.district} onChange={(e) => setFormPolice({...formPolice, district: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                            <input type="text" placeholder="Locality" value={formPolice.locality} onChange={(e) => setFormPolice({...formPolice, locality: e.target.value})} className="w-full bg-red-500/5 border border-red-500/20 p-2 text-xs text-white" required />
                        </div>
                        <button type="submit" className="w-full py-2 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/40 text-xs tracking-widest uppercase">Create Police Officer</button>
                    </form>
                </div>

                <div className="p-6 border border-purple-500/30 bg-black/40 rounded-xl">
                    <h2 className="text-lg text-purple-400 mb-4 tracking-widest">PROVISION LEGAL COUNSEL</h2>
                    <form onSubmit={(e) => handleCreateAccount(e, 'lawyer', formLawyer, setFormLawyer)} className="space-y-3">
                        <input type="text" placeholder="Full Name" value={formLawyer.fullName} onChange={(e) => setFormLawyer({...formLawyer, fullName: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                        <input type="email" placeholder="Counsel Email" value={formLawyer.email} onChange={(e) => setFormLawyer({...formLawyer, email: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                        <input type="password" placeholder="Passkey" value={formLawyer.password} onChange={(e) => setFormLawyer({...formLawyer, password: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="State" value={formLawyer.state} onChange={(e) => setFormLawyer({...formLawyer, state: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                            <input type="text" placeholder="District" value={formLawyer.district} onChange={(e) => setFormLawyer({...formLawyer, district: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                            <input type="text" placeholder="Locality" value={formLawyer.locality} onChange={(e) => setFormLawyer({...formLawyer, locality: e.target.value})} className="w-full bg-purple-500/5 border border-purple-500/20 p-2 text-xs text-white" required />
                        </div>
                        <button type="submit" className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/40 text-xs tracking-widest uppercase">Create Legal Counsel</button>
                    </form>
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
                                <div className={`text-[10px] uppercase px-2 py-1 rounded text-slate-300 ${u.role === 'police' ? 'bg-blue-500/20 text-blue-300' : u.role === 'lawyer' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10'}`}>
                                    {u.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
