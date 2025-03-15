// src/routes/transaction.routes.js
const router = require("express").Router();
const transactionController = require("../controllers/transactionController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// ================= BASIC CRUD / LIST / FILTER =====================

// 1) Create a new transaction
router.post(
  "/createTransaction",
  verifyToken,
  transactionController.createTransaction
);

// 2) Get all transactions (no filters)
router.get(
  "/allTransaction",
  verifyToken,
  transactionController.getAllTransactions
);

// 3) Get all transactions for the logged-in user
router.get(
  "/allTransaction/getOwnTransaction",
  verifyToken,
  transactionController.getOwnTransaction
);

// 4) Get transaction by ID
router.get(
  "/allTransaction/:transactionId",
  verifyToken,
  transactionController.getTransactionById
);

// 5) Filter by tags
router.get(
  "/filter/by-tags",
  verifyToken,
  transactionController.filterTransactionsByTags
);

// 6) Update transaction tags
router.put(
  "/transaction/:transactionId/tags",
  verifyToken,
  transactionController.updateTransactionTags
);

// 7) Sort transactions by date
router.get(
  "/sort/by-date",
  verifyToken,
  transactionController.sortTransactionsByDate
);

// 8) Update a transaction by ID
router.put(
  "/transaction/:transactionId",
  verifyToken,
  transactionController.updateTransaction
);

// 9) Delete a transaction by ID (admin only)
router.delete(
  "/transaction/:transactionId",
  verifyToken,
  isAdmin,
  transactionController.deleteTransaction
);

// ================= RECURRING & NOTIFICATIONS ======================

// 10) Get all recurring transactions
router.get(
  "/recurring",
  verifyToken,
  transactionController.getRecurringTransactions
);

// 11) Send transaction notifications (recurring upcoming/missed)
router.get(
  "/notifications",
  verifyToken,
  transactionController.sendTransactionNotification
);

// ================= REPORTS & SAVINGS =============================

// 12) Generate a financial report
router.get(
  "/report",
  verifyToken,
  transactionController.generateFinancialReport
);

// 13) Generate chart data for the financial report
router.get(
  "/report/chart",
  verifyToken,
  transactionController.generateChartData
);

// 14) Calculate monthly budget usage
router.get(
  "/report/monthly-budget",
  verifyToken,
  transactionController.calculateMonthlyBudget
);

// 15) Track savings progress
router.get(
  "/report/savings-progress",
  verifyToken,
  transactionController.trackSavingsProgress
);

module.exports = router;
