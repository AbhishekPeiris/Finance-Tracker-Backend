// src/services/goal.service.js
const Goal = require("../models/goalModel");
const mongoose = require("mongoose");

/**
 * Create a new goal
 */
exports.createGoal = async (userId, data) => {
  data.userId = userId;
  const newGoal = new Goal(data);
  return newGoal.save();
};

/**
 * Get all goals for a user
 */
exports.getGoals = async (userId) => {
  return Goal.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
};

/**
 * Get a specific goal by ID
 */
exports.getGoalById = async (userId, goalId) => {
  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return null;
  }
  return Goal.findOne({ _id: goalId, userId });
};

/**
 * Update a goal
 */
exports.updateGoal = async (userId, goalId, data) => {
  return Goal.findOneAndUpdate({ _id: goalId, userId }, data, { new: true });
};

/**
 * Delete a goal
 */
exports.deleteGoal = async (userId, goalId) => {
  return Goal.findOneAndDelete({ _id: goalId, userId });
};

/**
 * Track progress for each goal
 * => returns array of progress objects
 */
exports.trackAllGoalsProgress = async (userId) => {
  const goals = await Goal.find({
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (!goals) return [];

  return goals.map((goal) => {
    const percentageSaved = (
      (goal.currentAmount / goal.targetAmount) *
      100
    ).toFixed(2);

    return {
      _id: goal._id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      percentageSaved: percentageSaved + "%",
      deadline: goal.deadline,
      status:
        goal.currentAmount >= goal.targetAmount
          ? "Goal Achieved"
          : "In Progress",
      autoAllocate: goal.autoAllocate,
      allocationPercentage: goal.allocationPercentage,
    };
  });
};

/**
 * Allocate savings from an income transaction
 * => If autoAllocate=true, add a portion of the transaction to each goal
 */
exports.allocateSavingsAutomatically = async (transaction) => {
  const { userId, type, amount } = transaction;

  // Only allocate if it's an income transaction
  if (type !== "income" || amount <= 0) return;

  // Find all goals with autoAllocate = true
  const goals = await Goal.find({
    userId: new mongoose.Types.ObjectId(userId),
    autoAllocate: true,
  });

  for (const goal of goals) {
    // e.g., 10% of income is allocated
    const allocationAmount = (amount * goal.allocationPercentage) / 100;

    // Only add if we haven't exceeded the target
    if (goal.currentAmount + allocationAmount <= goal.targetAmount) {
      goal.currentAmount += allocationAmount;
      await goal.save();
    }
  }
};
