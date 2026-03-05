require("dotenv").config({ debug: true });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const logRoutes = require("./routes/logRoutes");
const caseRoutes = require("./routes/caseRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// This line fixes the preflight error
app.options("*", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

app.use("/api/logs", logRoutes);
app.use("/api/cases", caseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});