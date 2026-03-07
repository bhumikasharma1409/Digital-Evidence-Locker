/**
 * MyCases.jsx: List view of all cases registered by the user.
 * Allows filtering and searching of cases, and links directly to individual Case Details pages.
 */
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ConfirmationModal from "../components/ConfirmationModal";
import Toast from "../components/Toast";

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
    const chars = "01アイウエオカキクケコ░▒▓█ABCDEF0123456789".split("");
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

// --- Hex Badge ---
function HexBadge({ label, color = "teal" }) {
  const colors = {
    teal: { bg: "rgba(20,210,160,0.1)", border: "rgba(20,210,160,0.3)", text: "#14d2a0", dot: "bg-teal-400" },
    yellow: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308", dot: "bg-yellow-400" },
    blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", text: "#3b82f6", dot: "bg-blue-400" },
    purple: { bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.3)", text: "#a855f7", dot: "bg-purple-400" },
    green: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e", dot: "bg-green-400" },
  };
  const c = colors[color] || colors.teal;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text
    }}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {label}
    </div>
  );
}

const statusColors = {
  PENDING: "yellow",
  ASSIGNED: "blue",
  VERIFIED: "purple",
  CLOSED: "green",
};

export default function MyCases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [hoveredCase, setHoveredCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5001/api/cases", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.status === 401 || data.message === "Not authorized, no token" || data.message === "Not authorized. Token failed") {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (data.success) {
          setCases(data.data);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
    fetchCases();
  }, [navigate]);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevents case link navigation when hitting the delete button
    setDeleteTargetId(id);
  };

  const confirmDeleteCase = async () => {
    if (!deleteTargetId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`http://localhost:5001/api/cases/${deleteTargetId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setToastMessage({ text: data.message || "Not authorized to delete this case.", type: "error" });
        }
        setDeleteTargetId(null);
        return;
      }

      if (res.ok && data.success) {
        setCases(cases.filter(c => c._id !== deleteTargetId));
        setToastMessage({ text: "Case deleted successfully", type: "success" });
      } else {
        setToastMessage({ text: data.message || "Failed to delete the case.", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting case:", error);
      setToastMessage({ text: "An error occurred while deleting the case.", type: "error" });
    }
    setDeleteTargetId(null);
  };

  const stats = {
    total: cases.length,
    pending: cases.filter((c) => c.status === "PENDING").length,
    active: cases.filter((c) => c.status === "ASSIGNED" || c.status === "VERIFIED").length,
    closed: cases.filter((c) => c.status === "CLOSED").length,
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden relative" style={{ fontFamily: "system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <style>{`
          @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(20,210,160,0.3),0 0 40px rgba(20,210,160,0.1)}50%{box-shadow:0 0 50px rgba(20,210,160,0.6),0 0 100px rgba(20,210,160,0.2)}}
          @keyframes gridScroll{from{background-position:0 0}to{background-position:0 40px}}
          .grid-bg{background-image:linear-gradient(rgba(20,210,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,210,160,0.04) 1px,transparent 1px);background-size:40px 40px;animation:gridScroll 8s linear infinite;}
          @keyframes scanline{0%{transform:translateY(-5%)}100%{transform:translateY(105vh)}}
          .scanline{pointer-events:none;position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(20,210,160,0.06),transparent);animation:scanline 8s linear infinite;z-index:999;}
        `}</style>

      {/* Scanline effect */}
      <div className="scanline" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <MatrixRain />
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />

      <div className="relative z-10 p-8 md:p-12 max-w-6xl mx-auto">

        <div className="flex items-center mb-10 gap-5" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center glow-btn" style={{
            background: "linear-gradient(135deg,rgba(20,210,160,0.2),rgba(59,130,246,0.2))",
            border: "1px solid rgba(20,210,160,0.4)"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
            </svg>
          </div>
          <div>
            <div className="text-sm text-teal-400 font-black uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              ── DATABASE ──
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              Active <span className="text-teal-400">Cases</span>
            </h1>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.1s both" }}>
          {[
            { label: "Total Cases", val: stats.total, color: "#14d2a0", icon: "📁", delay: 0 },
            { label: "Pending Revisions", val: stats.pending, color: "#eab308", icon: "⏳", delay: 100 },
            { label: "Active Investigations", val: stats.active, color: "#3b82f6", icon: "👁️", delay: 200 },
            { label: "Closed Operations", val: stats.closed, color: "#22c55e", icon: "🔒", delay: 300 },
          ].map((s, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl text-center overflow-hidden border transition-all duration-300 hover:scale-[1.02]" style={{
              background: "rgba(0,0,0,0.4)",
              borderColor: `rgba(20,210,160,0.2)`,
              animation: `fadeSlideUp 0.8s ease ${0.1 + (s.delay / 1000)}s both`
            }}>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, ${s.color}20, transparent 70%)` }} />
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {s.val}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col md:flex-row gap-5 mb-10" style={{ animation: "fadeSlideUp 0.8s ease 0.3s both" }}>
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2" className="opacity-70 group-focus-within:opacity-100 transition-opacity">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="SEARCH DIRECTORY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-teal-400/50"
              style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(20,210,160,0.3)", color: "#14d2a0", fontFamily: "'Share Tech Mono', monospace" }}
            />
          </div>

          <div className="flex gap-2 bg-[rgba(0,0,0,0.6)] p-2 rounded-xl border border-teal-500/30 overflow-x-auto w-full md:w-auto">
            {["ALL", "PENDING", "ASSIGNED", "VERIFIED", "CLOSED"].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-colors flex-shrink-0 ${filterStatus === status ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
                style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* CASE LIST */}
        <div className="space-y-4">
          {filteredCases.map((c, i) => (
            <div
              key={c._id}
              onClick={() => navigate(`/case/${c._id}`)}
              onMouseEnter={() => setHoveredCase(c._id)}
              onMouseLeave={() => setHoveredCase(null)}
              className="group relative cursor-pointer p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:translate-x-2"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(20,210,160,0.2)",
                borderLeftWidth: hoveredCase === c._id ? "3px" : "1px",
                borderLeftColor: hoveredCase === c._id ? "#14d2a0" : "rgba(20,210,160,0.2)",
                animation: `fadeSlideUp 0.5s ease ${0.4 + (i * 0.1)}s both`
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 10% 50%, rgba(20,210,160,0.08), transparent 60%)" }} />

              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#14d2a010] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <HexBadge label={c.status || "NEW"} color={statusColors[c.status] || "teal"} />
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                      {c.title || "UNTITLED_RECORD"}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 max-w-3xl leading-relaxed">
                    {c.description || "No description provided for this record. Information may be classified or pending review."}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                      <span className="text-teal-500 w-2 h-2 rounded-full bg-teal-500/50" />
                      ID_ <span className="text-slate-300">{c._id}</span>
                    </span>
                    {c.createdAt && (
                      <span className="flex items-center gap-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        <span className="text-blue-500 w-2 h-2 rounded-full bg-blue-500/50" />
                        LOGGED_ <span className="text-slate-300">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex flex-col opacity-0 group-hover:opacity-100 transition-opacity items-end gap-3 text-teal-400 text-sm font-bold tracking-wider" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  <div className="flex items-center gap-2">
                    <span>ACCESS RECORD</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, c._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 rounded text-xs transition-colors"
                  >
                    <span>🗑️ DELETE</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredCases.length === 0 && (
          <div className="text-center py-20 rounded-2xl" style={{ border: "1px dashed rgba(20,210,160,0.2)", background: "rgba(0,0,0,0.2)", animation: "fadeSlideUp 0.8s ease 0.4s both" }}>
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <h3 className="text-lg text-slate-300 font-bold mb-2 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>NO RECORDS FOUND</h3>
            <p className="text-sm text-slate-500" style={{ fontFamily: "'Share Tech Mono', monospace" }}>Directory query returned 0 objects</p>
          </div>
        )}
      </div>

      {/* Custom UI Overlays */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        title="Confirm Deletion"
        message="Are you sure you want to delete this case? This action cannot be undone."
        confirmText="DELETE RECORD"
        cancelText="CANCEL"
        onConfirm={confirmDeleteCase}
        onCancel={() => setDeleteTargetId(null)}
      />

      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}