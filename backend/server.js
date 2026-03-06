require("dotenv").config({ debug: true });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const caseRoutes = require("./routes/caseRoutes");

const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true
}));

app.use(express.json());


app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});


app.use("/api/cases", caseRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});