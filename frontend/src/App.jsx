import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CitizenDashboard from "./pages/CitizenDashboard";
import MyCases from "./pages/MyCases";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/landing-page" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;