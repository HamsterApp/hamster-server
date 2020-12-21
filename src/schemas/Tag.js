const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      match: [/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, "Invalid HTML color code"],
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

const Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;
