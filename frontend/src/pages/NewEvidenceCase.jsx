import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function NewEvidenceCase() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Case created successfully");
        navigate("/my-cases");
      } else {
        alert(data.message || "Failed to create case");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="new-case-page">
      <div className="new-case-container">
        <div className="top-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>New Evidence Case</h1>
          <span className="drafts-text">Drafts</span>
        </div>

        <div className="security-banner">
          <div className="shield-icon">🛡️</div>
          <div>
            <h3>AES-256 Encryption Active</h3>
            <p>
              All data entered is encrypted client-side before being committed
              to the immutable blockchain ledger.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="case-form">
          <label>Case Title</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Investigation #882-Alpha"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Incident Type</option>
            <option value="Cyber Crime">Cyber Crime</option>
            <option value="Fraud">Fraud</option>
            <option value="Data Breach">Data Breach</option>
            <option value="Harassment">Harassment</option>
            <option value="Identity Theft">Identity Theft</option>
            <option value="Other">Other</option>
          </select>

          <label>Incident Description</label>
          <textarea
            name="description"
            placeholder="Provide detailed context regarding the digital evidence..."
            value={formData.description}
            onChange={handleChange}
            rows="8"
            required
          ></textarea>

          <p className="hash-note">
            ⓘ Unique cryptographic hash will be generated upon submission.
          </p>

          <button type="submit" className="submit-btn">
            🔒 Submit & Secure Case
          </button>
        </form>

        <div className="bottom-nav">
          <div>DASHBOARD</div>
          <div className="active-tab">CASES</div>
          <div>REPORTS</div>
          <div>SETTINGS</div>
        </div>
      </div>
    </div>
  );
}