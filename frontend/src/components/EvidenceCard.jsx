import { useState } from "react";
import axios from "axios";

// Evidence File Renderer helper merged into component body to use handleDownload

export default function EvidenceCard({ evidence, userRole, refreshData, usersList }) {
    const [actionLoading, setActionLoading] = useState(false);
    const [remarkInput, setRemarkInput] = useState("");
    const [noteInput, setNoteInput] = useState("");
    const [assignInput, setAssignInput] = useState("");

    const token = localStorage.getItem("token");
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const handleAction = async (method, route, payload = {}, successMsg) => {
        try {
            setActionLoading(true);
            await axios({
                method,
                url: `${API_BASE_URL}/api/evidence/${evidence._id}${route}`,
                data: payload,
                headers: { "Authorization": `Bearer ${token}` }
            });
            refreshData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this evidence?")) return;
        await handleAction("DELETE", "", {}, "Evidence deleted");
    };

    const handleShare = async (e) => {
        const targetUserId = e.target.value;
        if (!targetUserId) return;
        await handleAction("PUT", "/share", { targetUserId }, "Evidence shared");
    };

    const handleDownload = async () => {
        try {
            setActionLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/evidence/${evidence._id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", evidence.originalName || "evidence.bin");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Failed to securely download artifact.");
        } finally {
            setActionLoading(false);
        }
    };

    const renderEvidencePreview = (filePath) => {
        if (evidence.hasAccess === false) {
            return (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-black/40 border border-slate-700/50 relative overflow-hidden mt-4">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
                    <div className="text-4xl mb-4 opacity-50">🔒</div>
                    <h3 className="text-red-400 font-bold font-mono tracking-widest relative z-10 mb-2">ACCESS RESTRICTED</h3>
                    <p className="text-slate-500 text-xs font-mono mb-4 text-center">You do not have clearance to view this vault artifact.</p>
                    <button disabled={actionLoading} onClick={() => handleAction("PUT", "/request-access")} className="px-5 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-sm font-bold tracking-wider font-mono border border-slate-600 transition-colors shadow-lg relative z-10 hover:border-blue-400">
                        REQUEST SECURE ACCESS
                    </button>
                </div>
            );
        }

        if (!filePath) return null;
        const SERVER_URL = `${API_BASE_URL}/`;
        const fullUrl = filePath.startsWith("http") ? filePath : SERVER_URL + filePath.replace(/\\/g, '/');
        const ext = fullUrl.split('.').pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
            return (
                <div className="relative group rounded-xl overflow-hidden bg-black mt-4" style={{ aspectRatio: '16/9' }}>
                    <img src={fullUrl} alt="Evidence" className="w-full h-full object-contain" />
                    <button onClick={handleDownload} className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity uppercase font-mono border border-white/20 hover:bg-black/80">
                        Download Securely
                    </button>
                </div>
            );
        } else if (["mp4", "webm", "ogg"].includes(ext)) {
            return (
                <div className="relative rounded-xl overflow-hidden bg-black mt-4" style={{ aspectRatio: '16/9' }}>
                    <video src={fullUrl} controls className="w-full h-full object-contain" />
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-black/40 border border-slate-700 mt-4">
                    <div className="text-4xl mb-2">📄</div>
                    <button onClick={handleDownload} className="text-teal-400 hover:text-teal-300 text-sm font-bold font-mono underline">
                        Download Secure File
                    </button>
                </div>
            );
        }
    };

    return (
        <div className={`p-5 rounded-xl border relative mb-6 ${evidence.isLocked ? 'bg-red-900/10 border-red-500/30' : 'bg-black/30 border-teal-500/30'}`}>
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                <div>
                    <h4 className="text-teal-400 font-bold font-mono tracking-widest break-all">
                        {evidence.originalName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                        SEAL DIGEST: {evidence.hash ? evidence.hash.substring(0,24) + '...' : 'PENDING'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`px-2 py-1 uppercase font-bold text-[10px] font-mono rounded border ${
                        evidence.status === 'verified' ? 'bg-purple-900/40 text-purple-400 border-purple-500/50' : 
                        evidence.status === 'rejected' ? 'bg-red-900/40 text-red-400 border-red-500/50' : 
                        evidence.status === 'locked' ? 'bg-slate-900/40 text-slate-400 border-slate-500/50' : 
                        'bg-teal-900/40 text-teal-400 border-teal-500/50'
                    }`}>
                        {evidence.status}
                    </span>
                    {evidence.isLocked && <span className="text-red-500" title="LOCKED">🔒</span>}
                </div>
            </div>

            {renderEvidencePreview(evidence.filePath)}

            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                
                {/* --- USER ROLE CONTROLS --- */}
                {userRole === "user" && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {!["verified", "locked"].includes(evidence.status) && !evidence.isLocked && (
                            <button disabled={actionLoading} onClick={handleDelete} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 text-xs rounded uppercase font-mono hover:bg-red-500/20 transition">
                                Delete
                            </button>
                        )}
                        <select onChange={handleShare} className="bg-black border border-teal-500/30 text-xs text-teal-400 px-3 py-1 rounded font-mono" disabled={actionLoading} value="">
                            <option value="">Share with Agent/Lawyer...</option>
                            {usersList.filter(u => u.role === "police" || u.role === "lawyer").map(u => (
                                <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                )}


                {/* --- POLICE / FORENSIC / ADMIN CONTROLS --- */}
                {["police", "forensic", "admin"].includes(userRole) && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <button disabled={actionLoading || evidence.status === "verified"} onClick={() => handleAction("PUT", "/verify")} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-purple-500/20">
                                Validate
                            </button>
                            <button disabled={actionLoading || evidence.status === "rejected"} onClick={() => handleAction("PUT", "/reject")} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-red-500/20">
                                Reject
                            </button>
                            {!evidence.isLocked && (
                                <button disabled={actionLoading} onClick={() => handleAction("PUT", "/lock")} className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-slate-500/20">
                                    Lock
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={remarkInput}
                                onChange={(e) => setRemarkInput(e.target.value)}
                                placeholder="Add official cyber-remark..."
                                className="flex-1 bg-black/50 border border-teal-500/30 text-teal-400 px-3 py-1.5 text-xs rounded font-mono"
                            />
                            <button disabled={actionLoading || !remarkInput} onClick={() => { handleAction("PUT", "/remark", { text: remarkInput }); setRemarkInput(""); }} className="px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-mono rounded border border-teal-500/50 hover:bg-teal-500/30">
                                Add Log
                            </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input 
                                type="text" 
                                value={assignInput}
                                onChange={(e) => setAssignInput(e.target.value)}
                                placeholder="Enter Target Case ID..."
                                className="flex-1 bg-black/50 border border-blue-500/30 text-blue-400 px-3 py-1.5 text-xs rounded font-mono"
                            />
                            <button disabled={actionLoading || !assignInput} onClick={() => { handleAction("PUT", "/assign", { targetCaseId: assignInput }); setAssignInput(""); }} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded border border-blue-500/50 hover:bg-blue-500/30">
                                Assign Case
                            </button>
                        </div>
                    </div>
                )}


                {/* --- LAWYER CONTROLS --- */}
                {userRole === "lawyer" && (
                    <div className="space-y-4">
                        {evidence.hasAccess !== false && (
                            <button onClick={handleDownload} className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-blue-500/20">
                                Download Raw
                            </button>
                        )}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                placeholder="Add private local notes..."
                                className="flex-1 bg-black/50 border border-blue-500/30 text-blue-400 px-3 py-1.5 text-xs rounded font-mono"
                            />
                            <button disabled={actionLoading || !noteInput} onClick={() => { handleAction("PUT", "/note", { text: noteInput }); setNoteInput(""); }} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded border border-blue-500/50 hover:bg-blue-500/30">
                                Save Internal
                            </button>
                        </div>
                    </div>
                )}

                {/* --- DISPLAY REMARKS & NOTES --- */}
                {(evidence.policeRemarks?.length > 0 || evidence.lawyerNotes?.length > 0) && (
                    <div className="mt-4 p-3 rounded bg-black/40 border border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                        {evidence.policeRemarks?.map((r, i) => (
                            <div key={`remark-${i}`} className="mb-2 last:mb-0">
                                <span className="text-[10px] text-teal-500 font-bold uppercase font-mono">[{new Date(r.addedAt).toLocaleDateString()}] EXAMINER LOG: </span>
                                <span className="text-xs text-slate-300 font-mono">{r.text}</span>
                            </div>
                        ))}
                        {evidence.lawyerNotes?.map((n, i) => (
                            <div key={`note-${i}`} className="mb-2 last:mb-0">
                                <span className="text-[10px] text-blue-500 font-bold uppercase font-mono">[{new Date(n.addedAt).toLocaleDateString()}] PRIVATE COUNSEL MEMO: </span>
                                <span className="text-xs text-slate-300 font-mono italic">{n.text}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
