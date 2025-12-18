const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  updateFamilyProfile,
  getFamilyProfile
} = require("../controllers/settingsController");

const router = express.Router();

// Update family profile settings (creates or updates)
router.put("/family", authenticate, updateFamilyProfile);

// Get current family profile settings (auth)
router.get("/family", authenticate, getFamilyProfile);

// Public view for family profile settings (no auth)
router.get("/family/public", getFamilyProfile);

module.exports = router;