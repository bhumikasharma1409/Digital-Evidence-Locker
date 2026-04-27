import { useState, useEffect } from "react";
import axios from "axios";

export default function EvidenceCard({ evidence, userRole, refreshData, usersList, caseCreatorId, currentUserId }) {
    const [actionLoading, setActionLoading] = useState(false);
    const [assignInput, setAssignInput] = useState("");
    const [requestReason, setRequestReason] = useState("");
    
    // Tabs state
    const [activeTab, setActiveTab] = useState("preview");

    // Remote States
    const [custodyLogs, setCustodyLogs] = useState([]);
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState("");
    const [noteType, setNoteType] = useState("internal"); // police, lawyer, internal

    const token = localStorage.getItem("token");
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    useEffect(() => {
        if (activeTab === "custody") fetchCustodyLogs();
        if (activeTab === "notes") fetchNotes();
    }, [activeTab]);

    const fetchCustodyLogs = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/evidence/${evidence._id}/custody`, { headers: { Authorization: `Bearer ${token}` } });
            setCustodyLogs(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notes/${evidence._id}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotes(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleAction = async (method, route, payload = {}) => {
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
        await handleAction("DELETE", "");
    };

    const handleShare = async (e) => {
        const targetUserId = e.target.value;
        if (!targetUserId) return;
        await handleAction("PUT", "/share", { targetUserId });
    };

    const submitNote = async () => {
        if (!noteInput) return;
        try {
            setActionLoading(true);
            await axios.post(`${API_BASE_URL}/api/notes/${evidence._id}`, { text: noteInput, noteType }, { headers: { Authorization: `Bearer ${token}` } });
            setNoteInput("");
            fetchNotes();
        } catch (err) { alert("Failed to add note"); }
        finally { setActionLoading(false); }
    };

    const deleteNote = async (noteId) => {
        try {
            setActionLoading(true);
            await axios.delete(`${API_BASE_URL}/api/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchNotes();
        } catch (err) { console.error(err); }
        finally { setActionLoading(false); }
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

    const renderPreview = () => {
        if (evidence.hasAccess === false) {
            return (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-black/40 border border-slate-700/50 relative overflow-hidden mt-4">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
                    <div className="text-4xl mb-4 opacity-50">🔒</div>
                    <h3 className="text-red-400 font-bold font-mono tracking-widest relative z-10 mb-2">ACCESS RESTRICTED</h3>
                    <p className="text-slate-500 text-xs font-mono mb-4 text-center">You do not have clearance to view this vault artifact.</p>
                    <div className="flex flex-col gap-2 w-full max-w-xs relative z-10">
                        <input 
                            type="text" 
                            placeholder="Reason for access request..." 
                            value={requestReason} 
                            onChange={e => setRequestReason(e.target.value)} 
                            className="bg-black/80 border border-slate-600 text-slate-300 px-3 py-2 text-xs rounded font-mono w-full"
                        />
                        <button disabled={actionLoading} onClick={() => handleAction("POST", "/request-access", { reason: requestReason })} className="w-full py-2 bg-slate-800 text-white hover:bg-slate-700 rounded text-sm font-bold tracking-wider font-mono border border-slate-600 transition-colors shadow-lg hover:border-blue-400">
                            REQUEST SECURE ACCESS
                        </button>
                    </div>
                </div>
            );
        }

        const SERVER_URL = `${API_BASE_URL}/`;
        const fullUrl = evidence.filePath?.startsWith("http") ? evidence.filePath : SERVER_URL + evidence.filePath?.replace(/\\/g, '/');
        const ext = fullUrl?.split('.').pop().toLowerCase();

        return (
            <div className="relative group rounded-xl overflow-hidden bg-black mt-4 border border-white/5" style={{ aspectRatio: '16/9' }}>
                {["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? (
                    <img src={fullUrl} alt="Evidence" className="w-full h-full object-contain" />
                ) : ["mp4", "webm", "ogg"].includes(ext) ? (
                    <video src={fullUrl} controls className="w-full h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full h-48 bg-slate-900/50">
                        <div className="text-4xl mb-2">📄</div>
                        <span className="text-xs text-slate-400 font-mono">Binary File Viewer Disabled</span>
                    </div>
                )}
                {evidence.hasAccess !== false && (
                    <button onClick={handleDownload} className="absolute top-2 right-2 px-3 py-1 bg-black/80 text-teal-400 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity uppercase font-mono border border-teal-500/30 hover:bg-black">
                        Download Raw
                    </button>
                )}
            </div>
        );
    };

    const renderNotes = () => (
        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-700">
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono italic">No discussion data present.</p>
                ) : notes.map(note => (
                    <div key={note._id} className="p-3 bg-black/60 rounded border border-white/5 relative group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold font-mono uppercase text-slate-400">
                                {note.createdBy?.fullName || "Agent"} 
                                {note.noteType === 'police' && <span className="text-purple-400 ml-2">[POLICE MEMO]</span>}
                                {note.noteType === 'lawyer' && <span className="text-blue-400 ml-2">[COUNSEL MEMO]</span>}
                                {note.noteType === 'internal' && <span className="text-teal-400 ml-2">[INTERNAL]</span>}
                            </span>
                            <span className="text-[9px] text-slate-600 font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono">{note.text}</p>
                        {(note.createdBy?._id === JSON.parse(atob(token.split('.')[1])).id || userRole === "admin") && (
                            <button onClick={() => deleteNote(note._id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-400 text-xs font-mono">
                                x
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex gap-2 bg-black w-full p-1 rounded-lg border border-slate-700">
                <select value={noteType} onChange={e => setNoteType(e.target.value)} className="bg-black text-[10px] text-slate-300 outline-none border-none pl-2">
                    {userRole === 'lawyer' && <option value="lawyer">Private Counsel</option>}
                    {['police', 'admin', 'forensic'].includes(userRole) && <option value="police">Official Police</option>}
                    <option value="internal">Internal Discussion</option>
                </select>
                <input 
                    type="text" 
                    value={noteInput} 
                    onChange={e => setNoteInput(e.target.value)} 
                    placeholder="Append local thread..." 
                    className="flex-1 bg-transparent text-xs px-2 text-slate-300 focus:outline-none placeholder-slate-700 font-mono"
                />
                <button disabled={actionLoading || !noteInput} onClick={submitNote} className="px-3 bg-teal-900/40 text-teal-400 text-[10px] rounded hover:bg-teal-900/60 transition uppercase font-bold tracking-widest border border-teal-500/20">
                    Send
                </button>
            </div>
        </div>
    );

    const renderCustody = () => (
        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-slate-700 max-h-80 overflow-y-auto custom-scrollbar relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-800"></div>
            {custodyLogs.length === 0 ? (
                 <p className="text-xs text-slate-500 font-mono italic">No custody activity yet.</p>
            ) : custodyLogs.map((log, i) => (
                <div key={log._id} className="relative flex items-start mb-6 last:mb-0">
                    <div className="w-2 h-2 rounded-full bg-teal-500 absolute left-[6px] top-1.5 shadow-[0_0_8px_rgba(20,184,166,0.8)] z-10"></div>
                    <div className="ml-8 w-full">
                        <div className="flex flex-wrap justify-between items-baseline mb-1">
                            <span className="text-xs font-bold text-teal-400 font-mono uppercase tracking-wider">{log.actionTitle}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono">
                            <span className="text-slate-500">Actor:</span> {log.actorId ? `${log.actorId.fullName} (${log.actorRole.toUpperCase()})` : "System"}
                        </div>
                        {log.details && (
                            <div className="mt-1 text-[10px] text-slate-400 font-mono bg-black/30 p-2 border border-white/5 rounded italic">{log.details}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderRequests = () => {
        const pending = evidence.accessRequests?.filter(r => r.status === "pending") || [];
        return (
            <div className="mt-4 space-y-2">
                {pending.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono italic mt-4">No pending clearance requests.</p>
                ) : pending.map(req => (
                    <div key={req._id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-400 font-mono">{req.requestedBy?.fullName || "Agent"} ({req.requestedRole?.toUpperCase()})</span>
                            <span className="text-[10px] text-slate-400 font-mono italic">Reason: {req.reason}</span>
                            <span className="text-[9px] text-slate-600 font-mono mt-1">{new Date(req.requestedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                            <button disabled={actionLoading} onClick={() => handleAction("PUT", `/access-requests/${req._id}/approve`)} className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-teal-500/20">
                                Approve
                            </button>
                            <button disabled={actionLoading} onClick={() => handleAction("PUT", `/access-requests/${req._id}/reject`)} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-red-500/20">
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`p-5 rounded-xl border relative mb-6 ${evidence.isLocked ? 'bg-red-900/10 border-red-500/30' : 'bg-black/30 border-teal-500/30'} shadow-2xl`}>
            {/* Top Info Header */}
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

            {/* Custom Control Bar Above Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {userRole === "user" && !["verified", "locked"].includes(evidence.status) && !evidence.isLocked && (
                    <button disabled={actionLoading} onClick={handleDelete} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] rounded uppercase font-mono hover:bg-red-500/20">
                        Delete Data
                    </button>
                )}
                {userRole === "user" && (
                    <select onChange={handleShare} className="bg-black/50 border border-teal-500/30 text-[10px] text-teal-400 px-3 py-1 rounded font-mono" disabled={actionLoading} value="">
                        <option value="">Share with Agent/Lawyer...</option>
                        {usersList.filter(u => u.role === "police" || u.role === "lawyer").map(u => (
                            <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>
                        ))}
                    </select>
                )}
                {["police", "forensic", "admin"].includes(userRole) && (
                    <>
                        <button disabled={actionLoading || evidence.status === "verified"} onClick={() => handleAction("PUT", "/verify")} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-purple-500/20">Validate</button>
                        <button disabled={actionLoading || evidence.status === "rejected"} onClick={() => handleAction("PUT", "/reject")} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-red-500/20">Reject</button>
                        {!evidence.isLocked && <button disabled={actionLoading} onClick={() => handleAction("PUT", "/lock")} className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/50 text-[10px] rounded uppercase font-bold font-mono hover:bg-slate-500/20">Lock</button>}
                        <div className="flex flex-1 min-w-[200px]">
                            <input type="text" value={assignInput} onChange={(e) => setAssignInput(e.target.value)} placeholder="Assign to Case ID..." className="flex-1 bg-black/50 border-y border-l border-blue-500/30 text-blue-400 px-3 py-1 max-h-8 text-[10px] rounded-l font-mono outline-none" />
                            <button disabled={actionLoading || !assignInput} onClick={() => { handleAction("PUT", "/assign", { targetCaseId: assignInput }); setAssignInput(""); }} className="px-3 bg-blue-500/20 text-blue-400 text-[10px] font-mono rounded-r border border-blue-500/50 hover:bg-blue-500/30 max-h-8">Set</button>
                        </div>
                    </>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 mt-2">
                <button onClick={() => setActiveTab("preview")} className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest ${activeTab === "preview" ? "text-teal-400 border-b-2 border-teal-500 bg-teal-500/5" : "text-slate-500 hover:text-slate-300"}`}>
                    Media
                </button>
                <button onClick={() => setActiveTab("notes")} className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest ${activeTab === "notes" ? "text-teal-400 border-b-2 border-teal-500 bg-teal-500/5" : "text-slate-500 hover:text-slate-300"}`}>
                    Threads
                </button>
                <button onClick={() => setActiveTab("custody")} className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === "custody" ? "text-teal-400 border-b-2 border-teal-500 bg-teal-500/5" : "text-slate-500 hover:text-slate-300"}`}>
                    Custody Log <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                </button>
                {/* Only the Case Creator (User) or Admin can see and manage access requests */}
                {(userRole === "admin" || (userRole === "user" && currentUserId?.toString() === caseCreatorId?.toString())) && evidence.accessRequests?.some(r => r.status === "pending") && (
                    <button onClick={() => setActiveTab("requests")} className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === "requests" ? "text-orange-400 border-b-2 border-orange-500 bg-orange-500/5" : "text-orange-500/50 hover:text-orange-400"}`}>
                        Requests <span className="px-1.5 py-0.5 bg-orange-500 text-black rounded text-[9px]">{evidence.accessRequests.filter(r => r.status === "pending").length}</span>
                    </button>
                )}
            </div>

            {/* Active Tab Zone */}
            {activeTab === "preview" && renderPreview()}
            {activeTab === "notes" && renderNotes()}
            {activeTab === "custody" && renderCustody()}
            {activeTab === "requests" && renderRequests()}

        </div>
    );
}
