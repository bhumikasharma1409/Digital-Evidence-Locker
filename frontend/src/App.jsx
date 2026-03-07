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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/my-cases" element={<ProtectedRoute><MyCases /></ProtectedRoute>} />
        <Route path="/create-case" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
        <Route path="/case/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;