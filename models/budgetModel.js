// src/models/budget.model.js
const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      // if null or empty => monthly/overall budget
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now, // e.g., default is "now"
    },
    endDate: {
      type: Date,
      // for monthly or custom duration
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
