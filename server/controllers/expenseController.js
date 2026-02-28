const Expense = require("../models/Expense");
const Group = require("../models/Group");

// ─── Add Expense ───────────────────────────────────────────────────────────────
// POST /api/groups/:groupId/expenses
// Adds a new expense to a group with automatic or custom splitting
const addExpense = async (req, res) => {
  try {
    const { title, amount, paidBy, participants, splitType, customSplits } =
      req.body;
    const { groupId } = req.params;

    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Verify the logged-in user is a group member
    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    let splits = [];

    if (splitType === "equal") {
      // ─── Equal Split Logic ───────────────────────────────────────────────────
      // Divide the total amount equally among all participants
      const shareAmount = parseFloat((amount / participants.length).toFixed(2));
      splits = participants.map((userId) => ({
        user: userId,
        amount: shareAmount,
      }));
    } else {
      // ─── Custom Split Logic ──────────────────────────────────────────────────
      // Use the amounts provided by the user
      splits = customSplits.map((split) => ({
        user: split.userId,
        amount: parseFloat(split.amount),
      }));
    }

    // Create the expense in the database
    const expense = await Expense.create({
      group: groupId,
      title,
      amount: parseFloat(amount),
      paidBy,
      splits,
      splitType,
      createdBy: req.user._id,
    });

    // Populate user details for the response
    await expense.populate("paidBy", "name email");
    await expense.populate("splits.user", "name email");
    await expense.populate("createdBy", "name email");

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Expenses ──────────────────────────────────────────────────────────────
// GET /api/groups/:groupId/expenses
// Returns all expenses for a specific group
const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of this group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all expenses for this group, newest first
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splits.user", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Delete Expense ────────────────────────────────────────────────────────────
// DELETE /api/groups/:groupId/expenses/:expenseId
// Deletes an expense (only the person who created it can delete it)
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Only the creator of the expense can delete it
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this expense" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Balances ──────────────────────────────────────────────────────────────
// GET /api/groups/:groupId/balances
// Calculates net balance for each member based on all expenses
const getBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate(
      "members",
      "name email",
    );
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");

    // ─── Balance Calculation Logic ─────────────────────────────────────────────
    // Start everyone at 0
    const balances = {};
    group.members.forEach((member) => {
      balances[member._id.toString()] = {
        user: member,
        paid: 0, // Total amount this user paid
        owed: 0, // Total amount this user owes others
        net: 0, // paid - owed (positive = to receive, negative = owes)
      };
    });

    // Loop through every expense and update balances
    expenses.forEach((expense) => {
      const payerId = expense.paidBy._id.toString();

      // Add the full amount to the payer's "paid" total
      if (balances[payerId]) {
        balances[payerId].paid += expense.amount;
      }

      // Add each person's split amount to their "owed" total
      expense.splits.forEach((split) => {
        const userId = split.user._id.toString();
        if (balances[userId]) {
          balances[userId].owed += split.amount;
        }
      });
    });

    // Calculate net balance for each member (paid - owed)
    Object.keys(balances).forEach((userId) => {
      balances[userId].net = parseFloat(
        (balances[userId].paid - balances[userId].owed).toFixed(2),
      );
    });

    res.json(Object.values(balances));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addExpense, getExpenses, deleteExpense, getBalances };
