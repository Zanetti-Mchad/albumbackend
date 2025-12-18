const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  createFamilyMember,
  getAllFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember
} = require("../controllers/intergrationController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Family Member routes
router.post("/family-members", createFamilyMember);
router.get("/family-members", getAllFamilyMembers);
router.get("/family-members/:id", getFamilyMemberById);
router.put("/family-members/:id", updateFamilyMember);
router.delete("/family-members/:id", deleteFamilyMember);

module.exports = router;
