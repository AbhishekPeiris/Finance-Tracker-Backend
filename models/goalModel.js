// src/models/goal.model.js
const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      // optional date for when the goal should be completed
    },
    autoAllocate: {
      type: Boolean,
      default: false,
    },
    // A percentage (e.g., 10) means 10% of an income transaction is allocated
    allocationPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
