import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (role === 'police') return <Navigate to="/police-dashboard" replace />;
        if (role === 'lawyer') return <Navigate to="/lawyer-dashboard" replace />;
        return <Navigate to="/user-dashboard" replace />;
    }

    return children;
}
