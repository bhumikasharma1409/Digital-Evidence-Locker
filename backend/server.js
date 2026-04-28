require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const caseRoutes = require("./routes/caseRoutes");
const authRoutes = require("./routes/authRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const noteRoutes = require("./routes/noteRoutes");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const http = require("http");
const { Server } = require("socket.io");

connectDB();

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "digital-evidence-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});


app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinCase", (caseId) => {
    socket.join(caseId);
    console.log(`User joined case room: ${caseId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Routes
app.use("/api/cases", caseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});