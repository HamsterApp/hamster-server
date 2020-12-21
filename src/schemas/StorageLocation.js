const mongoose = require("mongoose");

const StorageLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StorageLocation",
      default: null,
    },
    info: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const StorageLocation = mongoose.model(
  "StorageLocation",
  StorageLocationSchema
);

module.exports = StorageLocation;
