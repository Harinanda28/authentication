const express = require("express");
const router = express.Router();
const { sendAlertEmail } = require("../utils/emailsend");

// Example POST route when a new vulnerability is detected
router.post("/", async (req, res) => {
  const { userEmail, vulnerabilityDetails } = req.body;

  if (!userEmail || !vulnerabilityDetails) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Send alert email
  const subject = "⚠️ Vulnerability Alert Detected!";
  const text = `Dear User,\n\nA new vulnerability has been detected:\n${vulnerabilityDetails}\n\nPlease take immediate action.`;

  await sendAlertEmail(userEmail, subject, text);

  res.json({ message: "Alert email sent successfully!" });
});

module.exports = router;