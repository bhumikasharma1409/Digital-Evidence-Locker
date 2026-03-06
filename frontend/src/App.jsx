import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenDashboard from "./pages/CitizenDashboard";
import MyCases from "./pages/MyCases";
import NewEvidenceCase from "./pages/NewEvidenceCase";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/new-case" element={<NewEvidenceCase />} />
        <Route path="/landing-page" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;