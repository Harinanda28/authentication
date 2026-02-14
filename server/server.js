const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", require("./routes/projectRoutes"));


// Test server alive
app.get("/hello", (req, res) => {
  res.send("Hello world!");
});

app.get("/test", (req, res) => res.json({ message: "Server is alive!" }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});
