const mongoose = require("mongoose");

const HistoryEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["added", "opened", "consumed"],
      default: "added",
    },
    entry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockEntry",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: false }
);

const HistoryEntry = mongoose.model("HistoryEntry", HistoryEntrySchema);

module.exports = HistoryEntry;
