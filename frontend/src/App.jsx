import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CitizenDashboard from "./pages/CitizenDashboard";
import MyCases from "./pages/MyCases";
import CaseDetails from "./pages/CaseDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CitizenDashboard />} />
        <Route path="/my-cases" element={<MyCases />} />
        <Route path="/case/:id" element={<CaseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;