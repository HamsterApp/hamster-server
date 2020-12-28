const mongoose = require("mongoose");

const NutrimentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { timestamps: false }
);

const NutrimentType = mongoose.model("NutrimentType", NutrimentTypeSchema);

module.exports = NutrimentType;
