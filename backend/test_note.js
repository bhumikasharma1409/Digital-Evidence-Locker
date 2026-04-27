const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Case = require('./models/case.model');
require('dotenv').config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const police = await User.findOne({ role: 'police' });
  if (!police) {
    console.log("No police found");
    process.exit(1);
  }
  
  const caseItem = await Case.findOne({ assignedPolice: police._id });
  if (!caseItem) {
    console.log("No case assigned to police");
    process.exit(1);
  }

  const token = jwt.sign({ id: police._id }, process.env.JWT_SECRET || "default_secret_key_change_in_production", { expiresIn: "30d" });

  try {
    const res = await fetch(`http://localhost:5001/api/cases/${caseItem._id}/notes`, {
      method: "POST",
      body: JSON.stringify({ text: "Test note from script" }),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await res.json();
    console.log("Success:", data);
  } catch (err) {
    console.error("Error:", err);
  }
  
  process.exit(0);
}
run();
