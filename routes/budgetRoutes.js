// src/routes/budget.routes.js
const router = require("express").Router();
const budgetController = require("../controllers/budgetController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a new budget
router.post("/createBudget", verifyToken, budgetController.createBudget);

// Check budget status (nearing or exceeding)
router.get("/status/check", verifyToken, budgetController.checkBudgetStatus);

// Provide budget adjustment recommendations
router.get(
  "/recommendations",
  verifyToken,
  budgetController.getBudgetRecommendations
);

// Get all budgets
router.get("/getAllBudgets", verifyToken, budgetController.getBudgets);

// Get all budgets for the logged-in user
router.get(
  "/getAllBudgets/getOwnBudgets",
  verifyToken,
  budgetController.getOwnBudgets
);

// Get a budget by ID
router.get(
  "/getAllBudgets/:budgetId",
  verifyToken,
  budgetController.getBudgetById
);

// Update a specific budget
router.put("/budget/:budgetId", verifyToken, budgetController.updateBudget);

// Delete a specific budget
router.delete("/budget/:budgetId", verifyToken, budgetController.deleteBudget);

module.exports = router;
