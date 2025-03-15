// src/models/report.model.js
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportType: { type: String },
    data: { type: Object }, // Store aggregated data or summary JSON
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
