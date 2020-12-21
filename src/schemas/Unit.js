const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Unit = mongoose.model("Unit", UnitSchema);

module.exports = Unit;
