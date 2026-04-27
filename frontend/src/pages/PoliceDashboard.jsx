import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket, connectSocket } from "../socket";

export default function PoliceDashboard() {
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

            const dashRes = await axios.get(`${API_BASE_URL}/api/dashboard/police`, {
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
        socket.on("evidence_status_updated", handleRefresh);

        return () => {
            socket.off("evidence_uploaded", handleRefresh);
            socket.off("evidence_status_updated", handleRefresh);
        };
    }, []);

    if (loading) return <div className="text-blue-400 p-8 font-mono">SYNCING POLICE DIRECTORY...</div>;

    const { localityEvidence, pendingVerification, verifiedEvidence, localityAssigned } = data;

    return (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-32 font-mono">
            <h1 className="text-3xl font-black text-white mb-2">Police Dispatch // <span className="text-blue-400">{user.fullName}</span></h1>
            <div className="text-xs text-blue-400/80 tracking-widest mb-8 border-b border-blue-500/20 pb-4">
                SECTOR ASSIGNED: {localityAssigned ? localityAssigned.toUpperCase() : "GLOBAL SATELLITE"}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-xl text-center">
                    <div className="text-3xl text-yellow-400 font-bold">{pendingVerification.length}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">PENDING VERIFICATION</div>
                </div>
                <div className="p-4 border border-teal-500/30 bg-teal-500/10 rounded-xl text-center">
                    <div className="text-3xl text-teal-400 font-bold">{verifiedEvidence.length}</div>
                    <div className="text-[10px] tracking-widest text-slate-400 mt-2">VERIFIED IN SECTOR</div>
                </div>
            </div>

            <h2 className="text-xl text-white mb-4 bg-blue-500/10 inline-block px-4 py-2 border border-blue-500/30 rounded">ACTION REQUIRED // QUEUE</h2>
            <div className="space-y-3 mb-8">
                {pendingVerification.map(ev => (
                    <div key={ev._id} className="p-5 border border-yellow-500/30 bg-black/60 rounded-lg flex justify-between items-center hover:border-yellow-400 transition-colors cursor-pointer" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                        <div>
                            <div className="text-yellow-400 text-sm font-bold">{ev.originalName}</div>
                            <div className="text-xs text-slate-500 mt-1">Uploader: {ev.uploadedBy?.fullName} | Locality: {ev.locality || 'N/A'}</div>
                        </div>
                        <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/50 hover:bg-yellow-500/40">REVIEW</button>
                    </div>
                ))}
                {pendingVerification.length === 0 && <div className="text-slate-500 text-sm p-4 border border-white/5 text-center bg-white/5 rounded">Sector clear. No pending verifications.</div>}
            </div>

            <h2 className="text-xl text-white mb-4">SECTOR EVIDENCE DATABASE</h2>
            <div className="space-y-3">
                {localityEvidence.filter(e => e.status !== "pending").map(ev => (
                    <div key={ev._id} className="p-4 border border-white/10 bg-black/40 rounded-lg flex justify-between items-center hover:border-blue-500/30 cursor-pointer" onClick={() => navigate(`/case/${ev.caseId?._id}`)}>
                        <div>
                            <div className="text-blue-400 text-sm">{ev.originalName}</div>
                            <div className="text-[10px] text-slate-500 mt-1">Status: {ev.status.toUpperCase()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
