// src/services/budget.service.js
const Budget = require("../models/budgetModel");
const transactionService = require("./transactionService");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

/**
 * Create a new budget
 */
exports.createBudget = async (userId, data) => {
  data.userId = userId;
  const budget = new Budget(data);
  return budget.save();
};

/**
 * Get all budgets for a user
 */
exports.getBudgets = async () => {
  const budgets = await Budget.find().sort({ createdAt: -1 });
  return budgets;
};
/**
 * Get a specific budget by its ID
 */
exports.getBudgetById = async (budgetId) => {
  return Budget.findOne({ _id: budgetId });
};

/**
 * Fetch all budgets for a specific user
 */
exports.getOwnBudgets = async (userId) => {
  return Budget.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({
    startDate: -1,
  });
};

/**
 * Update a specific budget for a user
 */
exports.updateBudget = async (userId, budgetId, data) => {
  // Ensure user can only update their own budgets
  return Budget.findOneAndUpdate({ _id: budgetId, userId }, data, {
    new: true,
  });
};

/**
 * Delete a specific budget for a user
 */
exports.deleteBudget = async (userId, budgetId) => {
  return Budget.findOneAndDelete({ _id: budgetId, userId });
};

/**
 * Check if the user is nearing or exceeding budget
 *  - This function can be triggered after every transaction or on demand
 */
exports.checkBudgetStatus = async (userId) => {
  // Always use 'new mongoose.Types.ObjectId(...)' or something equivalent
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get all budgets for this user
  const budgets = await Budget.find({ userId: userObjectId });
  const notifications = [];

  for (const budget of budgets) {
    // Build transaction query for this user
    const transactionsQuery = { userId: userObjectId };

    // Filter by category if budget has one
    if (budget.category) {
      transactionsQuery.category = budget.category;
    }

    // Filter by date range if applicable
    if (budget.startDate || budget.endDate) {
      transactionsQuery.date = {};
      if (budget.startDate) {
        transactionsQuery.date.$gte = budget.startDate;
      }
      if (budget.endDate) {
        transactionsQuery.date.$lte = budget.endDate;
      }
    }

    // Get the relevant transactions
    const transactions = await transactionService.getAllTransactions(
      userId,
      transactionsQuery
    );

    // Sum only expenses
    const totalSpent = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Compare to budget limits
    if (totalSpent >= budget.amount) {
      notifications.push(
        `Budget exceeded for ${budget.category || "overall"}!`
      );
    } else if (totalSpent >= budget.amount * 0.8) {
      notifications.push(
        `You are nearing your budget for ${budget.category || "overall"}.`
      );
    }
  }

  return notifications;
};

/**
 * Provide budget adjustment recommendations based on spending trends
 */
exports.getBudgetRecommendations = async (userId) => {
  const budgets = await Budget.find({
    userId: new mongoose.Types.ObjectId(userId),
  });
  const recommendations = [];

  for (let budget of budgets) {
    let transactionsQuery = { userId: new mongoose.Types.ObjectId(userId) };

    if (budget.category) {
      transactionsQuery.category = budget.category;
    }

    if (budget.startDate || budget.endDate) {
      transactionsQuery.date = {};
      if (budget.startDate) {
        transactionsQuery.date.$gte = budget.startDate;
      }
      if (budget.endDate) {
        transactionsQuery.date.$lte = budget.endDate;
      }
    }

    // Filter only expense transactions
    const transactions = await transactionService.getAllTransactions(
      userId,
      transactionsQuery
    );
    const totalSpent = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Basic recommendation logic:
    if (totalSpent > budget.amount) {
      recommendations.push(
        `You have exceeded your budget (${budget.amount}) for ${
          budget.category || "overall"
        }. ` + `Consider increasing your budget or reducing expenses.`
      );
    } else if (totalSpent > budget.amount * 0.5) {
      recommendations.push(
        `You have used more than 50% of your budget (${
          budget.category || "overall"
        }). ` +
          `Consider adjusting your budget or tracking expenses more carefully.`
      );
    } else {
      recommendations.push(
        `You have used less than 50% of your budget for ${
          budget.category || "overall"
        }. ` + `You could potentially lower your budget or save more.`
      );
    }
  }

  return recommendations;
};
