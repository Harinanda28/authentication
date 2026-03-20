const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getStats, getTrends } = require("../controllers/dashboardController");

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// GET /api/dashboard/stats
router.get("/stats", getStats);

// GET /api/dashboard/trends
router.get("/trends", getTrends);

module.exports = router;
