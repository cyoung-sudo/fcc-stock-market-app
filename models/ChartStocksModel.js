const mongoose = require("mongoose");

const ChartStocksSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  last_refreshed: {
    type: String,
    required: true
  },
  daily_data: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model("ChartStocks", ChartStocksSchema);