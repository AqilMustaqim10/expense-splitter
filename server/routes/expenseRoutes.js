const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/authMiddleware");
const {
  addExpense,
  getExpenses,
  deleteExpense,
  getBalances,
  getSettlements, // Add this
} = require("../controllers/expenseController");

// ─── Expense Routes ────────────────────────────────────────────────────────────
router.use(protect);

router.post("/", addExpense);
router.get("/", getExpenses);
router.delete("/:expenseId", deleteExpense);
router.get("/balances", getBalances);
router.get("/settlements", getSettlements); // New settlement route

module.exports = router;
