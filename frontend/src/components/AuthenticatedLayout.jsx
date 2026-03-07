import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function AuthenticatedLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
                {/* Nested routes render here */}
                <Outlet />
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between p-2 rounded-2xl backdrop-blur-2xl border border-teal-500/20 shadow-2xl shadow-black/80" style={{ background: "rgba(10,15,26,0.8)" }}>
                    {[
                        { label: "Home", icon: "🏠", path: "/dashboard" },
                        { label: "My Cases", icon: "📁", path: "/my-cases" },
                        { label: "Profile", icon: "🕵️", path: "/profile" },
                    ].map(link => {
                        const isActive = location.pathname === link.path;
                        return (
                            <button
                                key={link.label}
                                onClick={() => navigate(link.path)}
                                className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all group ${isActive ? "bg-teal-500/10" : "hover:bg-teal-500/10"}`}
                            >
                                <span className={`text-xl transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{link.icon}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-teal-400"}`}>
                                    {link.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
