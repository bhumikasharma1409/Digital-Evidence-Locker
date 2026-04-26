require("dotenv").config({ debug: true });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const caseRoutes = require("./routes/caseRoutes");
const authRoutes = require("./routes/authRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");



connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true
}));

app.use(express.json());

// Serve uploaded files statically as per requirements
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Routes
app.use("/api/cases", caseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/evidence", evidenceRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});