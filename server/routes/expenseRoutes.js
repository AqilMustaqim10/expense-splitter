const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams lets us access groupId from parent route
const { protect } = require("../middleware/authMiddleware");
const {
  addExpense,
  getExpenses,
  deleteExpense,
  getBalances,
} = require("../controllers/expenseController");

// ─── Expense Routes ────────────────────────────────────────────────────────────
// All routes require authentication
router.use(protect);

router.post("/", addExpense); // Add expense to group
router.get("/", getExpenses); // Get all expenses in group
router.delete("/:expenseId", deleteExpense); // Delete an expense
router.get("/balances", getBalances); // Get balances for group

module.exports = router;
