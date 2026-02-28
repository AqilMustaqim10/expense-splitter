const Group = require("../models/Group");

// ─── Create Group ──────────────────────────────────────────────────────────────
// POST /api/groups
// Creates a new group and automatically adds the creator as a member
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description,
      creator: req.user._id, // Set creator from logged-in user
      members: [req.user._id], // Creator is automatically a member
    });

    // Populate member details so frontend gets full user objects
    await group.populate("members", "name email");
    await group.populate("creator", "name email");

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get All Groups ────────────────────────────────────────────────────────────
// GET /api/groups
// Returns all groups where the logged-in user is a member
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }) // Only user's groups
      .populate("members", "name email") // Replace member IDs with full user data
      .populate("creator", "name email") // Replace creator ID with full user data
      .sort({ createdAt: -1 }); // Newest groups first

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Single Group ──────────────────────────────────────────────────────────
// GET /api/groups/:id
// Returns a single group by ID (must be a member to access)
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email")
      .populate("creator", "name email");

    // Group not found
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the logged-in user is actually a member of this group
    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString(),
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Add Member ────────────────────────────────────────────────────────────────
// POST /api/groups/:id/members
// Adds a new member to a group by their email address
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const User = require("../models/User");

    // Find the user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res
        .status(404)
        .json({ message: "User not found with that email" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only the group creator can add members
    if (group.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can add members" });
    }

    // Check if user is already a member
    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Add the user to the members array
    group.members.push(userToAdd._id);
    await group.save();

    // Return updated group with populated members
    await group.populate("members", "name email");
    await group.populate("creator", "name email");

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Remove Member ─────────────────────────────────────────────────────────────
// DELETE /api/groups/:id/members/:memberId
// Removes a member from the group (creator only)
const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only the creator can remove members
    if (group.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can remove members" });
    }

    // Cannot remove the creator from the group
    if (req.params.memberId === group.creator.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot remove the group creator" });
    }

    // Filter out the member to remove
    group.members = group.members.filter(
      (member) => member.toString() !== req.params.memberId,
    );

    await group.save();
    await group.populate("members", "name email");
    await group.populate("creator", "name email");

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete Group ──────────────────────────────────────────────────────────────
// DELETE /api/groups/:id
// Permanently deletes a group (creator only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only the creator can delete the group
    if (group.creator.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the creator can delete this group" });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroup,
  addMember,
  removeMember,
  deleteGroup,
};
