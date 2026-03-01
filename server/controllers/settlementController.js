const Settlement = require("../models/Settlement");
const Group = require("../models/Group");
const Expense = require("../models/Expense");

// ─── Helper: Calculate net balances ───────────────────────────────────────────
// Reusable function to calculate how much each person owes or is owed
// Takes into account confirmed settlements (reduces outstanding debt)
const calculateNetBalances = async (groupId) => {
  const group = await Group.findById(groupId).populate("members", "name email");
  const expenses = await Expense.find({ group: groupId })
    .populate("paidBy", "name email")
    .populate("splits.user", "name email");

  // Get all confirmed settlements for this group
  // These reduce the outstanding balance between two people
  const confirmedSettlements = await Settlement.find({
    group: groupId,
    status: "confirmed",
  });

  // Start everyone at 0
  const balanceMap = {};
  group.members.forEach((member) => {
    balanceMap[member._id.toString()] = { user: member, net: 0 };
  });

  // Add expense contributions to balance
  expenses.forEach((expense) => {
    const payerId = expense.paidBy._id.toString();
    if (balanceMap[payerId]) {
      balanceMap[payerId].net += expense.amount;
    }
    expense.splits.forEach((split) => {
      const userId = split.user._id.toString();
      if (balanceMap[userId]) {
        balanceMap[userId].net -= split.amount;
      }
    });
  });

  // Apply confirmed settlements to reduce outstanding balances
  // When A pays B a confirmed amount, A's debt reduces and B's credit reduces
  confirmedSettlements.forEach((s) => {
    const fromId = s.from.toString();
    const toId = s.to.toString();
    if (balanceMap[fromId]) balanceMap[fromId].net += s.amount;
    if (balanceMap[toId]) balanceMap[toId].net -= s.amount;
  });

  // Round all net balances to 2 decimal places
  Object.keys(balanceMap).forEach((userId) => {
    balanceMap[userId].net = parseFloat(balanceMap[userId].net.toFixed(2));
  });

  return balanceMap;
};

// ─── Helper: Generate settlement suggestions ───────────────────────────────────
// Same greedy algorithm as before but now uses adjusted balances
const generateSettlements = (balanceMap) => {
  let creditors = [];
  let debtors = [];

  Object.values(balanceMap).forEach(({ user, net }) => {
    if (net > 0.01) creditors.push({ user, amount: net });
    if (net < -0.01) debtors.push({ user, amount: Math.abs(net) });
  });

  const suggestions = [];

  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const settleAmount = parseFloat(
      Math.min(debtor.amount, creditor.amount).toFixed(2),
    );

    suggestions.push({
      from: debtor.user,
      to: creditor.user,
      amount: settleAmount,
    });

    debtor.amount = parseFloat((debtor.amount - settleAmount).toFixed(2));
    creditor.amount = parseFloat((creditor.amount - settleAmount).toFixed(2));

    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }

  return suggestions;
};

// ─── Get Settlements ───────────────────────────────────────────────────────────
// GET /api/groups/:groupId/settlements
// Returns both suggested (unpaid) transactions AND settlement history
const getSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Calculate current balances (accounting for confirmed settlements)
    const balanceMap = await calculateNetBalances(groupId);

    // Generate suggested transactions based on remaining balances
    const suggestions = generateSettlements(balanceMap);

    // Get all pending and confirmed settlements for history
    const history = await Settlement.find({
      group: groupId,
      status: { $in: ["pending", "confirmed", "cancelled"] },
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .sort({ createdAt: -1 }); // Newest first

    res.json({ suggestions, history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Mark As Paid ──────────────────────────────────────────────────────────────
// POST /api/groups/:groupId/settlements
// Debtor clicks "Mark as Paid" — creates a pending settlement record
const markAsPaid = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { toUserId, amount } = req.body;

    // Verify the group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    // Create the pending settlement record
    const settlement = await Settlement.create({
      group: groupId,
      from: req.user._id, // The logged-in user is the debtor
      to: toUserId, // The creditor they are paying
      amount: parseFloat(amount),
      status: "pending",
    });

    await settlement.populate("from", "name email");
    await settlement.populate("to", "name email");

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Confirm Payment ───────────────────────────────────────────────────────────
// PATCH /api/groups/:groupId/settlements/:settlementId/confirm
// Creditor confirms they received the money → status becomes "confirmed"
const confirmPayment = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);

    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    // Only the creditor (the "to" person) can confirm receipt
    if (settlement.to.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the recipient can confirm payment" });
    }

    if (settlement.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Settlement is not in pending state" });
    }

    // Mark as confirmed and record the time
    settlement.status = "confirmed";
    settlement.confirmedAt = new Date();
    await settlement.save();

    await settlement.populate("from", "name email");
    await settlement.populate("to", "name email");

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Cancel Settlement ─────────────────────────────────────────────────────────
// PATCH /api/groups/:groupId/settlements/:settlementId/cancel
// Either the debtor OR creditor can cancel/undo a pending settlement
const cancelSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);

    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }

    const userId = req.user._id.toString();
    const isDebtor = settlement.from.toString() === userId;
    const isCreditor = settlement.to.toString() === userId;

    // Only debtor or creditor can cancel
    if (!isDebtor && !isCreditor) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this settlement" });
    }

    // Can only cancel if still pending (not already confirmed)
    if (settlement.status === "confirmed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel an already confirmed settlement" });
    }

    settlement.status = "cancelled";
    await settlement.save();

    await settlement.populate("from", "name email");
    await settlement.populate("to", "name email");

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getSettlements,
  markAsPaid,
  confirmPayment,
  cancelSettlement,
};
