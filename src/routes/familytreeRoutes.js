const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  submitFamilyTree,
  getFamilyTree,
  getFamilyTreeMember,
  updateFamilyTreeMember,
  deleteFamilyTreeMember,
  deleteFamilyTree,
  getFamilyTreeStats,
  addFamilyTreeMember,
  getFamilyTreeMembers,
} = require("../controllers/familytreeController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Family Tree CRUD Operations
router.post("/", submitFamilyTree);                    // Create/update entire family tree
router.get("/", getFamilyTree);                        // Get user's family tree with all members
router.get("/stats", getFamilyTreeStats);              // Get family tree statistics
router.delete("/", deleteFamilyTree);                  // Delete entire family tree

// Family Tree Members CRUD Operations
router.get("/members", getFamilyTreeMembers);          // Get all members with filtering
router.post("/member", addFamilyTreeMember);           // Add single member to tree
router.get("/member/:memberId", getFamilyTreeMember);  // Get specific member
router.put("/member/:memberId", updateFamilyTreeMember); // Update specific member
router.delete("/member/:memberId", deleteFamilyTreeMember); // Delete specific member

module.exports = router;
