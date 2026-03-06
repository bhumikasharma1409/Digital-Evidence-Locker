import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyCases from "./pages/MyCases";
import LandingPage from "./pages/LandingPage";
import CreateCase from "./pages/CreateCase"; // Import newly created page
import CaseDetails from "./pages/CaseDetails"; // Import Evaluation-1 Case Details
import Dashboard from "./pages/Dashboard"; // Import new Dynamic Dashboard

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/" element={<LandingPage />} />


        <Route path="/create-case" element={<CreateCase />} />

        <Route path="/landing-page" element={<LandingPage />} />

        <Route path="/case/:id" element={<CaseDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;