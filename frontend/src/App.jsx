import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyCases from "./pages/MyCases";
import LandingPage from "./pages/LandingPage";
import CreateCase from "./pages/CreateCase"; // Import newly created page
import CaseDetails from "./pages/CaseDetails"; // Import Evaluation-1 Case Details
import Dashboard from "./pages/Dashboard"; // Import new Dynamic Dashboard
import Register from "./pages/Register"; // Import the Register page
import Login from "./pages/Login"; // Import the Login page
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

        {/* Protected Routes enclosed by the Authenticated Layout with Bottom Nav */}
        <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/my-cases" element={<MyCases />} />
          <Route path="/create-case" element={<CreateCase />} />
          <Route path="/case/:id" element={<CaseDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;