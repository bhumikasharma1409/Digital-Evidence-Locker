import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyCases from "./pages/MyCases";
import LandingPage from "./pages/LandingPage";
import CreateCase from "./pages/CreateCase"; // Import newly created page
import CaseDetails from "./pages/CaseDetails"; // Import Evaluation-1 Case Details
import UserDashboard from "./pages/UserDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PoliceLogin from "./pages/PoliceLogin";
import LawyerLogin from "./pages/LawyerLogin";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/police-login" element={<PoliceLogin />} />
        <Route path="/lawyer-login" element={<LawyerLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected Routes enclosed by the Authenticated Layout with Bottom Nav */}
        <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/my-cases" element={<MyCases />} />
          <Route path="/create-case" element={<CreateCase />} />
          <Route path="/case/:id" element={<CaseDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']}><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['police']}><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/police-dashboard" element={<PoliceDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['lawyer']}><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']}><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;