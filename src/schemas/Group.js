const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    targetStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    defaultLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StorageLocation",
      default: null,
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

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
