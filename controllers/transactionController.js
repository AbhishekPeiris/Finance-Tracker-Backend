// src/controllers/transaction.controller.js
const transactionService = require("../services/transactionService");

/**
 * Create a new transaction (income or expense)
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionData = await transactionService.createTransaction(
      userId,
      req.body
    );
    return res.status(201).json({
      message: "Transaction created successfully",
      data: transactionData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions (no filters)
 */
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found." });
    }
    return res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction by ID
 */
exports.getTransactionById = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const transaction = await transactionService.getTransactionById(
      transactionId
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    return res.status(200).json({ data: transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions for the logged-in user
 */
exports.getOwnTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactions = await transactionService.getOwnTransaction(userId);
    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transaction found for the logged-in user." });
    }
    return res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * Filter transactions by tags
 */
exports.filterTransactionsByTags = async (req, res, next) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({ message: "Tags parameter is required." });
    }
    const tagArray = tags.split(",").map((tag) => tag.trim());
    const transactions = await transactionService.filterTransactionsByTags(
      tagArray
    );
    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for the given tags." });
    }
    return res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction tags
 */
exports.updateTransactionTags = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res
        .status(400)
        .json({ message: "Tags must be a non-empty array." });
    }

    const updatedTransaction = await transactionService.updateTransactionTags(
      transactionId,
      tags
    );
    if (!updatedTransaction) {
      return res
        .status(404)
        .json({ message: `Transaction with ID ${transactionId} not found.` });
    }
    return res.status(200).json({
      message: "Transaction tags updated successfully.",
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sort transactions by date (asc/desc)
 */
exports.sortTransactionsByDate = async (req, res, next) => {
  try {
    const { order } = req.query; // 'asc' or 'desc'
    const sortOrder = order === "asc" ? 1 : -1;
    const transactions = await transactionService.sortTransactionsByDate(
      sortOrder
    );
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found." });
    }
    return res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a transaction by ID
 */
exports.updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const updatedTransaction = await transactionService.updateTransaction(
      transactionId,
      req.body
    );
    if (!updatedTransaction) {
      return res.status(404).json({
        message:
          "Transaction not found or you do not have permission to update it.",
      });
    }
    return res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a transaction by ID
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const deletedTransaction = await transactionService.deleteTransaction(
      transactionId
    );
    if (!deletedTransaction) {
      return res.status(404).json({
        message: `Transaction with ID ${transactionId} not found.`,
      });
    }
    return res.status(200).json({
      message: "Transaction deleted successfully.",
      data: deletedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recurring transactions
 */
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const recurringTx = await transactionService.getRecurringTransactions();
    if (!recurringTx || recurringTx.length === 0) {
      return res
        .status(404)
        .json({ message: "No recurring transactions found." });
    }
    return res.status(200).json({ data: recurringTx });
  } catch (error) {
    next(error);
  }
};

/**
 * Send transaction notifications for upcoming or missed recurring transactions
 */
exports.sendTransactionNotification = async (req, res, next) => {
  try {
    const notifications =
      await transactionService.sendTransactionNotification();
    return res.status(200).json({
      message: "Transaction notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a financial report (startDate, endDate, category, tags)
 */
exports.generateFinancialReport = async (req, res, next) => {
  try {
    const report = await transactionService.generateFinancialReport(req.query);
    return res.status(200).json({
      message: "Financial report generated successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate chart data for the financial report
 */
exports.generateChartData = async (req, res, next) => {
  try {
    const report = await transactionService.generateFinancialReport(req.query);
    const chartData = {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount",
          data: [report.totalIncome, report.totalExpenses],
        },
      ],
    };
    return res.status(200).json({
      message: "Chart data generated successfully",
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate monthly budget usage
 * => requires query: budget=xxx, month=xxx, year=xxx
 */
exports.calculateMonthlyBudget = async (req, res, next) => {
  try {
    const { budget, month, year } = req.query;
    if (!budget || !month || !year) {
      return res.status(400).json({
        message: "Budget, month, and year are required (query params).",
      });
    }
    const result = await transactionService.calculateMonthlyBudget(
      parseFloat(budget),
      parseInt(month),
      parseInt(year)
    );
    return res.status(200).json({
      message: "Monthly budget calculated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track savings progress
 */
exports.trackSavingsProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const progress = await transactionService.trackSavingsProgress(userId);
    // If no goals or no progress, you could handle it here
    if (!progress || progress.length === 0) {
      return res.status(404).json({
        message: "No savings goals found or no progress to show.",
      });
    }
    return res.status(200).json({
      message: "Savings progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Spending Trends Over Time
 * GET /api/reports/spending-trends?startDate=xxxx&endDate=xxxx&category=Food&tags=lunch,friend
 */
exports.getSpendingTrends = async (req, res, next) => {
  try {
    const userId = req.user.id; // from JWT
    const { startDate, endDate, category, tags } = req.query;

    // aggregator from transaction service
    const trends = await transactionService.getSpendingTrends(userId, {
      startDate,
      endDate,
      category,
      tags,
    });

    return res.status(200).json({
      message: "Spending trends fetched successfully",
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Income vs Expenses
 * GET /api/reports/income-vs-expenses?startDate=xxxx&endDate=xxxx
 */
exports.getIncomeVsExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, tags } = req.query;

    const result = await transactionService.getIncomeVsExpenses(userId, {
      startDate,
      endDate,
      category,
      tags,
    });

    return res.status(200).json({
      message: "Income vs. Expenses fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Example: A Combined Detailed Report
 * GET /api/reports/detailed?startDate=xxxx&endDate=xxxx
 * => includes trends + income vs. expenses + maybe raw transactions
 */
exports.getDetailedReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category, tags } = req.query;

    // 1) Spending trends
    const trends = await transactionService.getSpendingTrends(userId, {
      startDate,
      endDate,
      category,
      tags,
    });

    // 2) Income vs. expenses
    const summary = await transactionService.getIncomeVsExpenses(userId, {
      startDate,
      endDate,
      category,
      tags,
    });

    // 3) Possibly get all filtered transactions if needed
    // e.g. transactionService.getTransactions(userId, { startDate, endDate, category, tags })

    return res.status(200).json({
      message: "Detailed financial report fetched successfully",
      data: {
        trends,
        ...summary, // { income, expense }
      },
    });
  } catch (error) {
    next(error);
  }
};
