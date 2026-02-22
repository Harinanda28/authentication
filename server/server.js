const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route to check if server runs
app.get("/", (req, res) => res.send("Server is running!"));

// Routes – wrap in try/catch to catch missing files
try {
  const authRoutes = require("./routes/authRoutes");
  const vulnerabilityRoutes = require("./routes/vulnerabilityRoutes");
  const projectRoutes = require("./routes/projectRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/vulnerability", vulnerabilityRoutes);
  app.use("/api/projects", projectRoutes);
} catch (err) {
  console.error("Error loading routes:", err);
}

// Get port from .env or fallback
const PORT = process.env.PORT || 5002;

// Start server with error handling
app.listen(PORT, (err) => {
  if (err) {
    console.error("Server failed to start:", err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});