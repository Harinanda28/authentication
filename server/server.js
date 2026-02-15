const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const vulnerabilityRoutes = require("./routes/vulnerabilityRoutes");
const projectRoutes = require("./routes/projectRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vulnerability", vulnerabilityRoutes);
app.use("/api/projects", projectRoutes);



app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
