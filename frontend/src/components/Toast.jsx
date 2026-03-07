import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const colors = {
        success: { bg: "rgba(20,210,160,0.1)", border: "rgba(20,210,160,0.4)", text: "#14d2a0", icon: "✓" },
        error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.4)", text: "#ef4444", icon: "⚠️" },
    };

    const c = colors[type] || colors.success;

    return (
        <div className="fixed bottom-6 right-6 z-[2000] p-4 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-2xl"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
                fontFamily: "'Share Tech Mono', monospace",
                animation: "slideInRight 0.3s ease-out forwards"
            }}>
            <div className="w-1 shrink-0 absolute left-0 top-0 bottom-0 rounded-l-xl" style={{ backgroundColor: c.text }} />
            <span className="text-lg">{c.icon}</span>
            <span className="text-sm font-bold tracking-wide">{message}</span>
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
