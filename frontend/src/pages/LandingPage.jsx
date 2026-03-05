import React from "react";

export default function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-[#101622] text-slate-100 font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#101622]/80 backdrop-blur-md border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-blue-500">
                        shield_lock
                    </span>
                    <h2 className="text-lg font-bold tracking-tight">
                        Digital Evidence Locker
                    </h2>
                </div>

                <button className="text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors">
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative flex min-h-[520px] items-center justify-center text-center p-6 overflow-hidden">

                {/* Gradient circles background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl top-[10%] left-[20%]"></div>
                    <div className="absolute w-[500px] h-[500px] bg-teal-500 rounded-full blur-3xl bottom-[10%] right-[20%]"></div>
                </div>

                {/* Carbon texture */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
                    }}
                />

                <div className="relative z-10 max-w-xl">

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-xs">
                            verified_user
                        </span>
                        Government Grade Security
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black leading-tight">
                        Secure, Tamper-Proof Digital Evidence Management
                    </h1>

                    <p className="mt-4 text-slate-400 text-lg">
                        A specialized infrastructure for government agencies and cybercrime
                        investigators to manage evidence with immutable integrity.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button className="h-12 px-8 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                            Register Agency
                        </button>

                        <button className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md font-bold hover:bg-white/10 transition">
                            Request Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-12 px-6 bg-slate-900/50">

                <div className="text-center mb-10">
                    <h3 className="text-teal-400 text-sm font-black uppercase tracking-[0.2em]">
                        Process
                    </h3>
                    <h4 className="text-2xl font-bold mt-2">How it Works</h4>
                </div>

                <div className="grid md:grid-cols-3 gap-6">

                    {/* Upload */}
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-blue-500">
                        <span className="material-symbols-outlined text-3xl text-blue-500">
                            cloud_upload
                        </span>

                        <h2 className="mt-4 font-bold text-lg">Upload</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Securely ingest high-resolution digital assets from field devices
                            or cloud sources.
                        </p>
                    </div>

                    {/* Encrypt */}
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-teal-500">
                        <span className="material-symbols-outlined text-3xl text-teal-500">
                            enhanced_encryption
                        </span>

                        <h2 className="mt-4 font-bold text-lg">Encrypt</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Automatic AES-256 encryption for data at rest and TLS 1.3 for
                            data in transit.
                        </p>
                    </div>

                    {/* Verify */}
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-slate-400">
                        <span className="material-symbols-outlined text-3xl">
                            verified
                        </span>

                        <h2 className="mt-4 font-bold text-lg">Verify</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Blockchain-based hashing creates a permanent, immutable chain of
                            custody record.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-16">

                <h2 className="text-3xl font-black mb-3">
                    Enterprise Security Standards
                </h2>

                <p className="text-slate-400 max-w-xl mb-8">
                    Designed specifically for legal compliance and rigorous audit
                    requirements of high-profile digital investigations.
                </p>

                <div className="grid md:grid-cols-3 gap-6">

                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            history_toggle_off
                        </span>

                        <h3 className="font-bold mt-2">Comprehensive Audit Logs</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Complete forensic history of every access, modification, and
                            download event.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            inventory_2
                        </span>

                        <h3 className="font-bold mt-2">Immutable Storage</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Once uploaded, evidence cannot be altered or deleted, ensuring
                            court admissibility.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">
                            admin_panel_settings
                        </span>

                        <h3 className="font-bold mt-2">Granular Access Control</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Role-based permissions ensuring only authorized investigators
                            access sensitive files.
                        </p>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 p-8 text-center">

                <div className="flex justify-center items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-blue-500">
                        shield_lock
                    </span>
                    <span className="font-bold">EvidenceLocker</span>
                </div>

                <div className="flex justify-center gap-6 text-sm text-slate-400 mb-4">
                    <a href="#" className="hover:text-blue-500">Security</a>
                    <a href="#" className="hover:text-blue-500">Privacy</a>
                    <a href="#" className="hover:text-blue-500">Compliance</a>
                </div>

                <p className="text-xs text-slate-600">
                    © 2024 Digital Evidence Locker. Secure Gov Systems Inc.
                </p>

            </footer>
        </div>
    );
}