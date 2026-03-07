/**
 * LandingPage.jsx: The public-facing portal and entry point for the Digital Evidence Locker.
 * Provides an overview of features and a gateway for users to sign in or get access.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
            ctx.fillStyle = "rgba(16,22,34,0.15)";
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

// --- Glitch Text ---
function GlitchText({ text, className = "" }) {
    return (
        <span className={`relative inline-block ${className}`} style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            <style>{`
        @keyframes glitch1 {
          0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-2px,0)}
          20%{clip-path:inset(20% 0 60% 0);transform:translate(2px,0)}
          40%{clip-path:inset(50% 0 30% 0);transform:translate(-1px,0)}
          60%{clip-path:inset(80% 0 5% 0);transform:translate(1px,0)}
          80%{clip-path:inset(10% 0 80% 0);transform:translate(0,0)}
        }
        @keyframes glitch2 {
          0%,100%{clip-path:inset(90% 0 0 0);transform:translate(2px,0)}
          20%{clip-path:inset(60% 0 25% 0);transform:translate(-2px,0)}
          40%{clip-path:inset(30% 0 55% 0);transform:translate(1px,0)}
          60%{clip-path:inset(5% 0 85% 0);transform:translate(-1px,0)}
          80%{clip-path:inset(75% 0 15% 0);transform:translate(0,0)}
        }
        @keyframes scanline {
          0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}
        }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes fadeSlideUp {
          from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes pulseGlow {
          0%,100%{box-shadow:0 0 20px rgba(20,210,160,0.3),0 0 40px rgba(20,210,160,0.1)}
          50%{box-shadow:0 0 40px rgba(20,210,160,0.6),0 0 80px rgba(20,210,160,0.2)}
        }
        @keyframes borderFlow {
          0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}
        }
        @keyframes hexFloat {
          0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(3deg)}
        }
        @keyframes radarSweep {
          from{transform:rotate(0deg)} to{transform:rotate(360deg)}
        }
        @keyframes countUp { from{opacity:0} to{opacity:1} }
      `}</style>
            {text}
            <span aria-hidden className="absolute inset-0 text-teal-400" style={{
                animation: "glitch1 4s infinite linear", content: text
            }}>{text}</span>
            <span aria-hidden className="absolute inset-0 text-blue-400" style={{
                animation: "glitch2 4s infinite linear 0.5s"
            }}>{text}</span>
        </span>
    );
}

// --- Typed Text ---
function TypedText({ phrases }) {
    const [idx, setIdx] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const current = phrases[idx];
        let timeout;
        if (!deleting && displayed.length < current.length) {
            timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
        } else if (!deleting && displayed.length === current.length) {
            timeout = setTimeout(() => setDeleting(true), 2000);
        } else if (deleting && displayed.length > 0) {
            timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        } else if (deleting && displayed.length === 0) {
            setDeleting(false);
            setIdx((idx + 1) % phrases.length);
        }
        return () => clearTimeout(timeout);
    }, [displayed, deleting, idx, phrases]);
    return (
        <span className="text-teal-400" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            {displayed}<span className="opacity-80" style={{ animation: "blink 1s infinite" }}>_</span>
        </span>
    );
}

// --- Stat Counter ---
function StatCard({ value, label, icon }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                let start = 0;
                const step = () => {
                    start += Math.ceil(value / 60);
                    if (start >= value) { setCount(value); return; }
                    setCount(start);
                    requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                obs.disconnect();
            }
        });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [value]);
    return (
        <div ref={ref} className="relative p-6 rounded-2xl text-center overflow-hidden group" style={{
            background: "linear-gradient(135deg,rgba(20,210,160,0.05),rgba(59,130,246,0.05))",
            border: "1px solid rgba(20,210,160,0.2)"
        }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: "linear-gradient(135deg,rgba(20,210,160,0.08),rgba(59,130,246,0.08))"
            }} />
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                {count.toLocaleString()}+
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{label}</div>
        </div>
    );
}

// --- Hex Badge ---
function HexBadge({ label }) {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{
            background: "rgba(20,210,160,0.1)", border: "1px solid rgba(20,210,160,0.3)", color: "#14d2a0"
        }}>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {label}
        </div>
    );
}

// --- Feature Card ---
function FeatureCard({ icon, title, desc, accent = "teal", delay = 0 }) {
    const colors = {
        teal: { border: "rgba(20,210,160,0.4)", glow: "rgba(20,210,160,0.15)", text: "#14d2a0" },
        blue: { border: "rgba(59,130,246,0.4)", glow: "rgba(59,130,246,0.15)", text: "#3b82f6" },
        slate: { border: "rgba(148,163,184,0.4)", glow: "rgba(148,163,184,0.1)", text: "#94a3b8" },
    };
    const c = colors[accent];
    return (
        <div className="group relative p-6 rounded-2xl overflow-hidden cursor-default"
            style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${c.border}`,
                borderLeftWidth: "3px",
                animationDelay: `${delay}ms`,
                animation: "fadeSlideUp 0.6s ease both"
            }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{ background: `radial-gradient(circle at 30% 50%, ${c.glow}, transparent 70%)` }} />
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: `radial-gradient(circle, ${c.text}, transparent)` }} />
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="font-bold text-lg text-white mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: c.text }}>
                <span>LEARN MORE</span>
                <span>→</span>
            </div>
        </div>
    );
}

// --- Radar Widget ---
function RadarWidget() {
    return (
        <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(20,210,160,0.2)" }} />
            <div className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(20,210,160,0.2)" }} />
            <div className="absolute inset-8 rounded-full" style={{ border: "1px solid rgba(20,210,160,0.2)" }} />
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 origin-center" style={{
                    animation: "radarSweep 3s linear infinite",
                    background: "conic-gradient(from 0deg, transparent 270deg, rgba(20,210,160,0.4) 360deg)"
                }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </div>
        </div>
    );
}

// --- Terminal Line ---
function TerminalLog({ lines }) {
    const [visible, setVisible] = useState([]);
    useEffect(() => {
        lines.forEach((_, i) => {
            setTimeout(() => setVisible(v => [...v, i]), i * 700);
        });
    }, []);
    return (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(20,210,160,0.2)", background: "rgba(0,0,0,0.6)" }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "rgba(20,210,160,0.2)", background: "rgba(20,210,160,0.05)" }}>
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-teal-500/60" />
                <span className="ml-2 text-xs text-slate-500" style={{ fontFamily: "'Share Tech Mono', monospace" }}>evidence-locker — bash</span>
            </div>
            <div className="p-4 space-y-1 min-h-[160px]">
                {lines.map((line, i) => visible.includes(i) && (
                    <div key={i} className="text-xs flex gap-2" style={{ fontFamily: "'Share Tech Mono', monospace", animation: "fadeSlideUp 0.3s ease" }}>
                        <span className="text-teal-500 select-none">$</span>
                        <span className={line.type === "success" ? "text-teal-400" : line.type === "warn" ? "text-yellow-400" : "text-slate-300"}>{line.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const terminalLines = [
        { text: "initialize evidence-locker --secure", type: "cmd" },
        { text: "✓ AES-256 encryption loaded", type: "success" },
        { text: "✓ Blockchain anchor connected", type: "success" },
        { text: "✓ Chain-of-custody module active", type: "success" },
        { text: "⚠ Awaiting agency authentication...", type: "warn" },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-100 overflow-x-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            <style>{`
        @keyframes glitch1{0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-2px,0)}20%{clip-path:inset(20% 0 60% 0);transform:translate(2px,0)}40%{clip-path:inset(50% 0 30% 0);transform:translate(-1px,0)}60%{clip-path:inset(80% 0 5% 0);transform:translate(1px,0)}80%{clip-path:inset(10% 0 80% 0);transform:translate(0,0)}}
        @keyframes glitch2{0%,100%{clip-path:inset(90% 0 0 0);transform:translate(2px,0)}20%{clip-path:inset(60% 0 25% 0);transform:translate(-2px,0)}40%{clip-path:inset(30% 0 55% 0);transform:translate(1px,0)}60%{clip-path:inset(5% 0 85% 0);transform:translate(-1px,0)}80%{clip-path:inset(75% 0 15% 0);transform:translate(0,0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(20,210,160,0.3),0 0 40px rgba(20,210,160,0.1)}50%{box-shadow:0 0 50px rgba(20,210,160,0.6),0 0 100px rgba(20,210,160,0.2)}}
        @keyframes radarSweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes hexFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes gridScroll{from{background-position:0 0}to{background-position:0 40px}}
        .grid-bg{background-image:linear-gradient(rgba(20,210,160,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(20,210,160,0.04) 1px,transparent 1px);background-size:40px 40px;animation:gridScroll 8s linear infinite;}
        .glow-btn{animation:pulseGlow 3s ease-in-out infinite;}
        .threat-bar{transition:width 1.5s cubic-bezier(.4,0,.2,1);}
        @keyframes scanline{0%{transform:translateY(-5%)}100%{transform:translateY(105vh)}}
        .scanline{pointer-events:none;position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(20,210,160,0.06),transparent);animation:scanline 8s linear infinite;z-index:999;}
      `}</style>

            {/* Scanline effect */}
            <div className="scanline" />

            {/* Navbar */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-[#0a0f1a]/95 border-b border-teal-500/20 backdrop-blur-xl" : "py-5 bg-transparent"}`}>
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center glow-btn" style={{
                            background: "linear-gradient(135deg,rgba(20,210,160,0.2),rgba(59,130,246,0.2))",
                            border: "1px solid rgba(20,210,160,0.4)"
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                        <span className="font-black tracking-tight text-white text-lg" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            Evidence<span className="text-teal-400">Locker</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        {["Features", "Security", "Compliance", "Pricing"].map(item => (
                            <a key={item} href="#" className="hover:text-teal-400 transition-colors duration-200 relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-teal-400 group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-bold text-slate-400 hover:text-teal-400 transition-colors px-4 py-2">
                            Sign In
                        </button>
                        <button onClick={() => navigate('/register')} className="text-sm font-bold px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{ background: "linear-gradient(135deg,#14d2a0,#3b82f6)", color: "#0a0f1a" }}>
                            Get Access
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 grid-bg opacity-60" />

                {/* Matrix Rain */}
                <MatrixRain />

                {/* Gradient orbs */}
                <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#14d2a0,transparent)" }} />
                <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#3b82f6,transparent)" }} />

                <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-20">
                    <div style={{ animation: "fadeSlideUp 0.8s ease both" }}>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <HexBadge label="FIPS 140-2 Certified" />
                            <HexBadge label="SOC 2 Type II" />
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-2 text-white">
                            The Vault for
                        </h1>
                        <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6">
                            <TypedText phrases={["Digital Evidence", "Cyber Forensics", "Case Management", "Chain of Custody"]} />
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                            Military-grade infrastructure for government agencies and cybercrime investigators. Every byte cryptographically sealed. Every access permanently logged.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => navigate('/register')} className="h-13 px-8 py-3.5 rounded-xl font-black text-sm tracking-wider transition-all hover:scale-105 hover:brightness-110 glow-btn"
                                style={{ background: "linear-gradient(135deg,#14d2a0,#0ea5e9)", color: "#0a0f1a" }}>
                                ⚡ REGISTER AGENCY
                            </button>

                        </div>

                        <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
                            {["No credit card required", "99.999% uptime SLA", "24/7 SOC monitoring"].map((t, i) => (
                                <span key={i} className="flex items-center gap-1.5">
                                    <span className="text-teal-500">✓</span> {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Terminal + Radar */}
                    <div className="space-y-4" style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}>
                        <TerminalLog lines={terminalLines} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl flex items-center gap-4" style={{
                                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(20,210,160,0.2)"
                            }}>
                                <RadarWidget />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Threat Level</div>
                                    <div className="text-lg font-black text-teal-400" style={{ fontFamily: "'Share Tech Mono', monospace" }}>MINIMAL</div>
                                    <div className="text-xs text-slate-600 mt-1">0 anomalies</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl space-y-3" style={{
                                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(59,130,246,0.2)"
                            }}>
                                <div className="text-xs text-slate-500 uppercase tracking-widest">Integrity Score</div>
                                {[
                                    { label: "Files Verified", pct: 100, color: "#14d2a0" },
                                    { label: "Audit Coverage", pct: 98, color: "#3b82f6" },
                                    { label: "Hash Matches", pct: 100, color: "#14d2a0" },
                                ].map(({ label, pct, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-400">{label}</span>
                                            <span style={{ color, fontFamily: "'Share Tech Mono', monospace" }}>{pct}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5">
                                            <div className="h-full rounded-full threat-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}80)` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 border-y border-teal-500/10" style={{ background: "rgba(20,210,160,0.02)" }}>
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard value={480} label="Agencies Secured" icon="🏛️" />
                    <StatCard value={12} label="Million Files Sealed" icon="🔒" />
                    <StatCard value={99999} label="Uptime SLA (0.001% error)" icon="⚡" />
                    <StatCard value={256} label="Bit AES Encryption" icon="🛡️" />
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <div className="text-xs text-teal-400 font-black uppercase tracking-[0.3em] mb-3" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            ── PROTOCOL ──
                        </div>
                        <h2 className="text-4xl font-black text-white">Forensic-Grade Pipeline</h2>
                        <p className="text-slate-400 mt-3 max-w-lg mx-auto">Every piece of evidence follows an unbreakable cryptographic chain from ingestion to court submission.</p>
                    </div>

                    <div className="relative grid md:grid-cols-4 gap-0">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px" style={{
                            background: "linear-gradient(90deg,transparent,rgba(20,210,160,0.5),rgba(59,130,246,0.5),transparent)"
                        }} />

                        {[
                            { step: "01", icon: "📡", label: "Ingest", desc: "Field devices push via encrypted API endpoint with zero-knowledge auth", color: "teal" },
                            { step: "02", icon: "🔐", label: "Seal", desc: "AES-256 encryption + SHA-3 hash computed and anchored to blockchain", color: "blue" },
                            { step: "03", icon: "🔗", label: "Chain", desc: "Immutable chain-of-custody entry created, timestamped by atomic clock", color: "teal" },
                            { step: "04", icon: "⚖️", label: "Export", desc: "Court-ready packages with full cryptographic provenance reports", color: "blue" },
                        ].map(({ step, icon, label, desc, color }, i) => (
                            <div key={step} className="relative flex flex-col items-center text-center px-4 py-6" style={{ animation: `fadeSlideUp 0.5s ease ${i * 150}ms both` }}>
                                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl z-10"
                                    style={{
                                        background: color === "teal" ? "rgba(20,210,160,0.1)" : "rgba(59,130,246,0.1)",
                                        border: `1px solid ${color === "teal" ? "rgba(20,210,160,0.4)" : "rgba(59,130,246,0.4)"}`,
                                    }}>
                                    {icon}
                                    <span className="absolute -top-2 -right-2 text-xs font-black px-1.5 py-0.5 rounded" style={{
                                        fontFamily: "'Share Tech Mono', monospace",
                                        background: color === "teal" ? "#14d2a0" : "#3b82f6", color: "#000"
                                    }}>{step}</span>
                                </div>
                                <h3 className="font-black text-white mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{label}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="mb-14">
                        <div className="text-xs text-teal-400 font-black uppercase tracking-[0.3em] mb-3" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            ── CAPABILITIES ──
                        </div>
                        <h2 className="text-4xl font-black text-white max-w-lg">Enterprise-Grade Security Arsenal</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        <FeatureCard icon="📋" title="Immutable Audit Logs" accent="teal" delay={0}
                            desc="Cryptographically signed log entries for every access event, download, and chain transfer. Tamper-evident by design." />
                        <FeatureCard icon="🧊" title="Write-Once Storage" accent="blue" delay={100}
                            desc="WORM-compliant architecture ensures uploaded evidence cannot be deleted or modified — ever. Court-admissible by default." />
                        <FeatureCard icon="👁️" title="Zero-Trust Access" accent="teal" delay={200}
                            desc="Every request authenticated via MFA + hardware tokens. Granular role-based permissions down to individual file level." />
                        <FeatureCard icon="🔍" title="Forensic Metadata" accent="blue" delay={300}
                            desc="GPS coordinates, device fingerprints, timestamps, and integrity hashes automatically extracted and sealed with evidence." />
                        <FeatureCard icon="🌐" title="Multi-Agency Sharing" accent="teal" delay={400}
                            desc="Securely share evidence between agencies with time-limited, watermarked access links and full transfer audit trails." />
                        <FeatureCard icon="🤖" title="AI Anomaly Detection" accent="blue" delay={500}
                            desc="Machine learning models flag unusual access patterns, bulk downloads, or integrity violations in real time." />
                    </div>
                </div>
            </section>

            {/* Compliance Band */}
            <section className="py-14 px-6 overflow-hidden" style={{ background: "linear-gradient(135deg,rgba(20,210,160,0.05),rgba(59,130,246,0.05))", borderTop: "1px solid rgba(20,210,160,0.1)", borderBottom: "1px solid rgba(20,210,160,0.1)" }}>
                <div className="max-w-6xl mx-auto text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-8" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        Compliance Certifications
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        {["CJIS", "FedRAMP", "NIST 800-53", "ISO 27001", "SOC 2 Type II", "FIPS 140-2", "GDPR", "HIPAA"].map(cert => (
                            <div key={cert} className="px-5 py-2.5 rounded-lg text-sm font-black text-slate-300 hover:text-teal-400 transition-colors"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Share Tech Mono', monospace" }}>
                                {cert}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(#14d2a0,transparent)" }} />
                </div>

                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="text-xs text-teal-400 font-black uppercase tracking-[0.3em] mb-4" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        ── SECURE ACCESS ──
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                        Ready to Lock Down<br />Your Digital Evidence?
                    </h2>
                    <p className="text-slate-400 text-lg mb-10">
                        Join 480+ government agencies securing mission-critical evidence. Deployment in under 48 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/register')} className="px-10 py-4 rounded-xl font-black text-sm tracking-wider glow-btn transition-all hover:scale-105"
                            style={{ background: "linear-gradient(135deg,#14d2a0,#0ea5e9)", color: "#0a0f1a" }}>
                            ⚡ REGISTER YOUR AGENCY
                        </button>
                        <button className="px-10 py-4 rounded-xl font-black text-sm tracking-wider text-slate-300 hover:text-teal-400 transition-colors"
                            style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                            SCHEDULE A BRIEFING →
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t px-6 py-12" style={{ borderColor: "rgba(20,210,160,0.1)", background: "rgba(0,0,0,0.5)" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                                    background: "rgba(20,210,160,0.15)", border: "1px solid rgba(20,210,160,0.3)"
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14d2a0" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <span className="font-black text-white" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    Evidence<span className="text-teal-400">Locker</span>
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-xs">Tamper-proof digital evidence infrastructure for government and law enforcement.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-12 text-sm">
                            {[
                                { title: "Product", links: ["Features", "Security", "Pricing", "Changelog"] },
                                { title: "Legal", links: ["Privacy", "Terms", "Compliance", "CJIS Policy"] },
                                { title: "Support", links: ["Docs", "Status", "Contact", "SLA"] },
                            ].map(({ title, links }) => (
                                <div key={title}>
                                    <div className="text-xs font-black text-teal-400 uppercase tracking-widest mb-3" style={{ fontFamily: "'Share Tech Mono', monospace" }}>{title}</div>
                                    {links.map(l => (
                                        <a key={l} href="#" className="block text-slate-500 hover:text-slate-300 transition-colors mb-2">{l}</a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-xs text-slate-600" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            © 2025 Digital Evidence Locker · Secure Gov Systems Inc. · All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-teal-400">ALL SYSTEMS OPERATIONAL</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
