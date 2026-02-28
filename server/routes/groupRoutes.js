const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createGroup,
  getGroups,
  getGroup,
  addMember,
  removeMember,
  deleteGroup,
} = require("../controllers/groupController");

// ─── Group Routes ──────────────────────────────────────────────────────────────
// All routes are protected — user must be logged in
router.use(protect); // Apply protect middleware to ALL routes below

router.post("/", createGroup); // Create a new group
router.get("/", getGroups); // Get all groups for logged-in user
router.get("/:id", getGroup); // Get a single group by ID
router.post("/:id/members", addMember); // Add a member by email
router.delete("/:id/members/:memberId", removeMember); // Remove a member
router.delete("/:id", deleteGroup); // Delete a group

module.exports = router;
