import React from "react";

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "DELETE", cancelText = "CANCEL" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div
                className="relative w-full max-w-md p-6 md:p-8 rounded-2xl border flex flex-col items-center text-center shadow-2xl"
                style={{
                    background: "rgba(10,15,26,0.9)",
                    borderColor: "rgba(239,68,68,0.4)",
                    boxShadow: "0 0 50px rgba(239,68,68,0.15)",
                    animation: "fadeSlideUp 0.3s ease-out forwards"
                }}
            >
                {/* Warning Icon */}
                <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/30 text-3xl">
                    ⚠️
                </div>

                <div className="text-xs text-red-400 font-black uppercase tracking-[0.3em] mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    ── {title} ──
                </div>

                <h3 className="text-xl font-bold text-slate-200 mb-6 font-mono leading-relaxed">
                    {message}
                </h3>

                <div className="flex w-full gap-4 mt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs font-bold tracking-widest uppercase transition-all"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 rounded-xl border border-red-500/50 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
