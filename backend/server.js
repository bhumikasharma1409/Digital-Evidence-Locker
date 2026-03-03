require("dotenv").config();

const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

connectDB();       // connects to MongoDB

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});