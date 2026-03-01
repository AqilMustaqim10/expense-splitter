const express = require("express");
const router = express.Router({ mergeParams: true }); // Access groupId from parent
const { protect } = require("../middleware/authMiddleware");
const {
  getSettlements,
  markAsPaid,
  confirmPayment,
  cancelSettlement,
} = require("../controllers/settlementController");

// ─── Settlement Routes ─────────────────────────────────────────────────────────
// All routes require authentication
router.use(protect);

router.get("/", getSettlements); // Get suggestions + history
router.post("/", markAsPaid); // Debtor marks as paid
router.patch("/:settlementId/confirm", confirmPayment); // Creditor confirms received
router.patch("/:settlementId/cancel", cancelSettlement); // Either party cancels

module.exports = router;
