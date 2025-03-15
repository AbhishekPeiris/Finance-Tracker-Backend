// src/controllers/goal.controller.js
const goalService = require("../services/goalService");

/**
 * Create a new financial goal
 */
exports.createGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goal = await goalService.createGoal(userId, req.body);
    return res.status(201).json({
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all goals for the logged-in user
 */
exports.getGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goals = await goalService.getGoals(userId);
    if (!goals || goals.length === 0) {
      return res.status(404).json({
        message: "No goals found for the logged-in user.",
      });
    }
    return res.status(200).json({ data: goals });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific goal by ID
 */
exports.getGoalById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const goal = await goalService.getGoalById(userId, goalId);
    if (!goal) {
      return res.status(404).json({
        message: `Goal with ID ${goalId} not found or not accessible.`,
      });
    }
    return res.status(200).json({ data: goal });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a financial goal
 */
exports.updateGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const updatedGoal = await goalService.updateGoal(userId, goalId, req.body);

    if (!updatedGoal) {
      return res.status(404).json({
        message: `Goal with ID ${goalId} not found or not accessible.`,
      });
    }
    return res.status(200).json({
      message: "Goal updated successfully",
      data: updatedGoal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a financial goal
 */
exports.deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const deletedGoal = await goalService.deleteGoal(userId, goalId);
    if (!deletedGoal) {
      return res.status(404).json({
        message: `Goal with ID ${goalId} not found or not accessible.`,
      });
    }
    return res.status(200).json({
      message: "Goal deleted successfully",
      data: deletedGoal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track progress toward goals
 */
exports.trackAllGoalsProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await goalService.trackAllGoalsProgress(userId);
    if (!progress || progress.length === 0) {
      return res.status(404).json({
        message: "No goals found or no progress to show.",
      });
    }
    return res.status(200).json({
      message: "Goals progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
