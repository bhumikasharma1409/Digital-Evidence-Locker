import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket, connectSocket } from "../socket";

export default function LawyerDashboard() {
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

            const dashRes = await axios.get(`${API_BASE_URL}/api/dashboard/lawyer`, {
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
        socket.on("access_request_updated", handleRefresh);

        return () => {
            socket.off("evidence_uploaded", handleRefresh);
            socket.off("access_request_updated", handleRefresh);
        };
    }, []);

    if (loading) return <div className="text-purple-400 p-8 font-mono">SYNCING LEGAL DIRECTORY...</div>;

    const { sharedEvidence, availableInLocality, localityAssigned } = data;

    return (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-32 font-mono">
            <h1 className="text-3xl font-black text-white mb-2">Legal Counsel // <span className="text-purple-400">{user.fullName}</span></h1>
            <div className="text-xs text-purple-400/80 tracking-widest mb-8 border-b border-purple-500/20 pb-4">
                PRACTICING SECTOR: {localityAssigned ? localityAssigned.toUpperCase() : "GLOBAL"}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-purple-500/30 bg-purple-500/10 rounded-xl text-center hover:bg-purple-500/20 transition-all cursor-pointer">
                    <div className="text-3xl text-purple-400 font-bold">{sharedEvidence.length}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">SECURE ACCESS GRANTED</div>
                </div>
                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                    <div className="text-3xl text-slate-300 font-bold">{availableInLocality.length}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">DISCOVERABLE IN SECTOR</div>
                </div>
            </div>

            <h2 className="text-xl text-white mb-4 bg-purple-500/10 inline-block px-4 py-2 border border-purple-500/30 rounded">AUTHORIZED EVIDENCE BANK</h2>
            <div className="space-y-3 mb-8">
                {sharedEvidence.map(ev => (
                    <div key={ev._id} className="p-5 border border-purple-500/30 bg-black/60 rounded-lg flex justify-between items-center hover:border-purple-400 transition-colors cursor-pointer" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                        <div>
                            <div className="text-purple-400 text-sm font-bold">{ev.originalName}</div>
                            <div className="text-xs text-slate-500 mt-1">Uploader: {ev.uploadedBy?.fullName} | Case: {ev.caseId?.title || 'External'}</div>
                        </div>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 border border-purple-500/50 rounded">VIEW DOSSIER</span>
                    </div>
                ))}
                {sharedEvidence.length === 0 && <div className="text-slate-500 text-sm p-4 border border-white/5 text-center bg-white/5 rounded">No explicit access granted yet.</div>}
            </div>

            <h2 className="text-xl text-white mb-4">SECTOR DISCOVERY POOL</h2>
            <div className="space-y-3">
                {availableInLocality.map(ev => (
                    <div key={ev._id} className="p-4 border border-white/10 bg-black/40 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="text-slate-300 text-sm blur-[2px] select-none hover:blur-none transition-all">{ev.originalName.substring(0,4)}... [CLASSIFIED]</div>
                            <div className="text-[10px] text-slate-500 mt-1">Locality Match // Awaiting Authorization</div>
                        </div>
                        <button onClick={() => navigate(`/case/${ev.caseId?._id}`)} className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] border border-white/20 hover:bg-white/10">REQUEST ACCESS</button>
                    </div>
                ))}
                {availableInLocality.length === 0 && <div className="text-slate-500 text-sm p-4 border border-white/5 text-center bg-white/5 rounded">No new evidence discovered in your sector.</div>}
            </div>
        </div>
    );
}
