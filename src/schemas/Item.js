const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    ean: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    nutriments: [
      {
        // NutrimentType key
        type: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
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
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },
    conversions: [
      {
        fromAmount: {
          type: Number,
          min: 0,
          required: true,
        },
        toUnit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Unit",
          required: true,
        },
        toAmount: {
          type: Number,
          min: 0,
          required: true,
        },
      },
    ],
    defaultLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StorageLocation",
      default: null,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    targetStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      match: [/^[a-zA-Z0-9_-]*$/, "Slug has to be URL safe string"],
    },
    thumbnail: {
      type: String,
    },
    images: [{ type: String }],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
