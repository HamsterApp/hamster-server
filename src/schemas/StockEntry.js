const mongoose = require("mongoose");

const StockEntrySchema = new mongoose.Schema(
  {
    bestBefore: {
      type: Date,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StorageLocation",
      default: null,
    },
    price: {
      type: Number,
      min: 0,
    },
    store: {
      type: String,
    },
    opened: {
      type: Boolean,
      default: false,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);

const StockEntry = mongoose.model("StockEntry", StockEntrySchema);

module.exports = StockEntry;
