const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { logLogoutAction } = require("../controllers/logoutcontroller");
const router = express.Router();

// Route to log user logout actions
router.post("/logout", authenticate, logLogoutAction);

module.exports = router;