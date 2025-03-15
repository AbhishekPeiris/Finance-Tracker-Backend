// src/services/transaction.service.js
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Transaction = require("../models/transactionModel");
const goalService = require("./goalService");
// If you have a Goal model, import it (for trackSavingsProgress, allocateSavingsAutomatically):
// const Goal = require("../models/goal.model"); // <-- Example

/**
 * Create a new transaction for a given user
 * (Optionally auto-allocate savings if it's an income transaction)
 */
exports.createTransaction = async (userId, data) => {
  data.userId = userId;
  const newTx = new Transaction(data);
  const savedTx = await newTx.save();

  // If it's an income transaction, allocate savings automatically
  if (savedTx.type === "income") {
    await goalService.allocateSavingsAutomatically(savedTx);
  }

  return savedTx;
};

/**
 * Get all transactions (no filters)
 */
exports.getAllTransactions = async () => {
  return Transaction.find().sort({ date: -1 });
};

/**
 * Get a transaction by ID
 */
exports.getTransactionById = async (transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return null;
  }
  return Transaction.findById(transactionId);
};

/**
 * Get all transactions for a specific user
 */
exports.getOwnTransaction = async (userId) => {
  return Transaction.find({ userId: new mongoose.Types.ObjectId(userId) }).sort(
    {
      date: -1,
    }
  );
};

/**
 * Filter transactions by tags
 */
exports.filterTransactionsByTags = async (tagsArray) => {
  const query = {
    tags: { $in: tagsArray },
  };
  return Transaction.find(query).sort({ date: -1 });
};

/**
 * Sort transactions by date (asc or desc)
 */
exports.sortTransactionsByDate = async (sortOrder) => {
  return Transaction.find().sort({ date: sortOrder });
};

/**
 * Update transaction tags
 */
exports.updateTransactionTags = async (transactionId, tags) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return null;
  }
  return Transaction.findByIdAndUpdate(
    transactionId,
    { tags },
    { new: true, runValidators: true }
  );
};

/**
 * Update a transaction by ID
 */
exports.updateTransaction = async (transactionId, data) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error("Invalid transaction ID.");
  }
  return Transaction.findByIdAndUpdate(transactionId, data, {
    new: true,
    runValidators: true,
  });
};

/**
 * Delete a transaction by ID
 */
exports.deleteTransaction = async (transactionId) => {
  return Transaction.findOneAndDelete({ _id: transactionId });
};

/**
 * Get all recurring transactions (for all users or you can filter by user ID)
 */
exports.getRecurringTransactions = async () => {
  return Transaction.find({ isRecurring: true }).sort({ date: -1 });
};

/**
 * Send transaction notifications for upcoming or missed recurring transactions
 */
exports.sendTransactionNotification = async () => {
  const now = new Date();
  const upcomingThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // next 24 hours

  // Missed recurring transactions
  const missedTransactions = await Transaction.find({
    isRecurring: true,
    date: { $lt: now },
    $or: [
      { recurrenceEndDate: { $exists: false } },
      { recurrenceEndDate: { $gt: now } },
    ],
  }).sort({ date: -1 });

  // Upcoming recurring transactions
  const upcomingTransactions = await Transaction.find({
    isRecurring: true,
    date: { $gte: now, $lte: upcomingThreshold },
    $or: [
      { recurrenceEndDate: { $exists: false } },
      { recurrenceEndDate: { $gt: now } },
    ],
  }).sort({ date: 1 });

  return { missed: missedTransactions, upcoming: upcomingTransactions };
};

/**
 * Generate a financial report based on filters (startDate, endDate, category, tags)
 */
exports.generateFinancialReport = async (filters) => {
  const { startDate, endDate, category, tags } = filters;
  let query = {};

  // Date range
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Category
  if (category) {
    query.category = category;
  }

  // Tags
  if (tags) {
    query.tags = { $in: tags.split(",") };
  }

  const transactions = await Transaction.find(query);

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += tx.amount;
    if (tx.type === "expense") totalExpenses += tx.amount;
  });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactions,
  };
};

/**
 * Generate chart data for financial report
 * (We can do this in the controller, but shown here if you prefer)
 * => Typically handled in the controller, but leaving if needed
 */
// exports.generateChartData = async (filters) => { ... } // or do in controller

/**
 * Calculate monthly budget usage
 */
exports.calculateMonthlyBudget = async (budget, month, year) => {
  // E.g., March 2025 => month=3, year=2025
  const startDate = new Date(year, month - 1, 1); // First day of that month
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of that month

  // All transactions in this month
  const transactions = await Transaction.find({
    date: { $gte: startDate, $lte: endDate },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += tx.amount;
    if (tx.type === "expense") totalExpenses += tx.amount;
  });

  const remainingBudget = budget - totalExpenses;
  const budgetExceeded = remainingBudget < 0;

  let recommendation = "You are within budget!";
  if (budgetExceeded) {
    recommendation =
      `Budget exceeded by ${Math.abs(remainingBudget)}. ` +
      `Consider reducing expenses in non-essential categories.`;
  } else if (remainingBudget < budget * 0.2) {
    recommendation = `You are nearing your budget limit. Remaining: ${remainingBudget}`;
  }

  return {
    totalIncome,
    totalExpenses,
    remainingBudget,
    budgetExceeded,
    recommendation,
  };
};

/**
 * Track savings progress for the logged-in user
 * => Depends on a "Goal" model if you're storing user goals
 */
exports.trackSavingsProgress = async (userId) => {
  const goals = await Goal.find({ userId });
  if (!goals) return [];

  const progress = goals.map((goal) => {
    const percentageSaved = (
      (goal.currentAmount / goal.targetAmount) *
      100
    ).toFixed(2);
    return {
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      percentageSaved: percentageSaved + "%",
      deadline: goal.deadline,
      status:
        goal.currentAmount >= goal.targetAmount
          ? "Goal Achieved"
          : "In Progress",
    };
  });

  return progress;
};

/**
 * Allocate savings automatically for an income transaction
 */
// In goal.service.js (already shown above, but repeated for reference)
exports.allocateSavingsAutomatically = async (transaction) => {
  const { userId, type, amount } = transaction;
  if (type !== "income" || amount <= 0) return;

  const goals = await Goal.find({
    userId: transaction.userId,
    autoAllocate: true,
  });

  for (const goal of goals) {
    const allocationAmount = (amount * goal.allocationPercentage) / 100;
    if (goal.currentAmount + allocationAmount <= goal.targetAmount) {
      goal.currentAmount += allocationAmount;
      await goal.save();
    }
  }
};

exports.getSpendingTrends = async (userId, filters = {}) => {
  const { startDate, endDate, category, tags } = filters;

  // Build a match query for the aggregator
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
    type: "expense", // we only track spending trends
  };

  // Date range
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  // Category
  if (category) {
    match.category = category;
  }

  // Tags
  if (tags) {
    // expecting comma-separated tags, e.g. "food,lunch"
    const tagArray = tags.split(",").map((tag) => tag.trim());
    match.tags = { $in: tagArray };
  }

  /**
   * Example grouping by MONTH:
   * If you want to group by day or week, you can adapt $group accordingly.
   */
  const trends = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $month: "$date" }, // group by month
        totalSpent: { $sum: "$amount" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  return trends; // e.g., [ { _id: 1, totalSpent: 200 }, ... ]
};

/**
 * Income vs. Expenses
 * - Sums income & expenses within a given filter range
 */
exports.getIncomeVsExpenses = async (userId, filters = {}) => {
  const { startDate, endDate, category, tags } = filters;
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  // Date range
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  // Category
  if (category) {
    match.category = category;
  }

  // Tags
  if (tags) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    match.tags = { $in: tagArray };
  }

  const data = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  // Summarize
  let income = 0;
  let expense = 0;
  data.forEach((d) => {
    if (d._id === "income") income = d.totalAmount;
    if (d._id === "expense") expense = d.totalAmount;
  });

  return { income, expense };
};
