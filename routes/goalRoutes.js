// src/routes/goal.routes.js
const router = require("express").Router();
const goalController = require("../controllers/goalController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a new goal
router.post("/", verifyToken, goalController.createGoal);

// Get all goals for the logged-in user
router.get("/", verifyToken, goalController.getGoals);

// Get a specific goal by ID
router.get("/:goalId", verifyToken, goalController.getGoalById);

// Update a goal
router.put("/:goalId", verifyToken, goalController.updateGoal);

// Delete a goal
router.delete("/:goalId", verifyToken, goalController.deleteGoal);

// Track progress for all goals
router.get("/progress/all", verifyToken, goalController.trackAllGoalsProgress);

module.exports = router;
