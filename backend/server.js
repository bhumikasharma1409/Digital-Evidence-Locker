require("dotenv").config({ debug: true });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const logRoutes = require("./routes/logRoutes");
const caseRoutes = require("./routes/caseRoutes"); // 👈 ADD THIS

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.use("/api/logs", logRoutes);
app.use("/api/cases", caseRoutes); // 👈 ADD THIS

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});