const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Case = require('./models/case.model');
require('dotenv').config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const caseItem = await Case.findOne({ description: "hmm k" });
  if (!caseItem) {
    console.log("No case found with description 'hmm k'");
    process.exit(1);
  }
  
  console.log("Found case:", caseItem._id);
  
  const policeId = caseItem.assignedPolice;
  if (!policeId) {
    console.log("No assigned police for this case");
    process.exit(1);
  }
  
  const token = jwt.sign({ id: policeId }, process.env.JWT_SECRET || "default_secret_key_change_in_production", { expiresIn: "30d" });

  try {
    const res = await fetch(`http://localhost:5001/api/cases/${caseItem._id}/notes`, {
      method: "POST",
      body: JSON.stringify({ text: "Test note from script 2" }),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error:", err);
  }
  
  process.exit(0);
}
run();
