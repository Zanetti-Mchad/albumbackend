/*const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { logSecurityAction, getSecurityLogs } = require("../controllers/logscontroller");
const router = express.Router();

// Route to log security actions
router.post("/logs", authenticate, logSecurityAction);

// Route to get security logs by user ID
router.get("/logs/:userId", authenticate, getSecurityLogs); // Ensure you implement getSecurityLogs


module.exports = router;*/

const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { logSecurityAction, getSecurityLogs } = require("../controllers/logscontroller");

const router = express.Router();

// POST /api/v1/logs
router.post("/", authenticate, logSecurityAction);

// GET /api/v1/logs/:userId
router.get("/:userId", authenticate, getSecurityLogs);

module.exports = router;