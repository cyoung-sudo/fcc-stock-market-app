const express = require("express");
// Model
const ChartStocks = require("../models/ChartStocksModel");
// Util
const stockAPI = require("../utils/stockAPI");

const chartStocksRoutes = express.Router();

//----- Retrive stock data & add to DB
chartStocksRoutes.post("/api/chartStocks/addStock", (req, res) => {
  // Retrieve all chart-stocks
  ChartStocks.find({})
  .then(allStocks => {
    // Limit chart to 2 stocks due to API limit
    if(allStocks.length < 2) {
      stockAPI.requestStockData(req.body.symbol)
      .then(apiRes => {
        //--- API success
        let symbol = apiRes["Meta Data"]["2. Symbol"].toUpperCase();
        let last_refreshed = apiRes["Meta Data"]["3. Last Refreshed"];
        let daily_data = [];
        // Format daily-data from object to array
        for(const [key, value] of Object.entries(apiRes["Time Series (Daily)"])) {
          // Round price to 2 decimals
          let close = Math.round(value["4. close"] * 100) / 100;
          daily_data.push({
            symbol: symbol,
            date: key,
            close: close
          });
        }
        // Create document
        let newStock = new ChartStocks({
          symbol: symbol,
          last_refreshed: last_refreshed,
          daily_data: daily_data
        });
        // Save document
        newStock.save()
        .then(savedDoc => {
          res.json({ success: true });
        })
        .catch(err => {
          // Duplicate stock
          res.json({ 
            success: false,
            message: "Duplicate stock"
          });
        });
      })
      .catch(err => {
        //--- API error
        res.json({ 
          success: false,
          message: err
        });
      });
    } else {
      // Chart limit reached
      res.json({ 
        success: false,
        message: "Limit reached: 2 stocks max"
      });
    }
  })
  .catch(err => console.log(err));
});

//----- Remove stock data from DB
chartStocksRoutes.delete("/api/chartStocks/removeStock", (req, res) => {
  ChartStocks.findOneAndDelete({ symbol: req.body.symbol })
  .then(idk => {
    res.json({ success: true });
  })
  .catch(err => console.log(err));
});

//----- Retrive stock data for all existing chart-stocks & add to DB
chartStocksRoutes.get("/api/chartStocks/existingStocks", (req, res) => {
  ChartStocks.find({})
  .then(allStocks => {
    let allData = [];
    let promises = [];
    let error = "";
    // Request for updated data for existing stocks
    for(let stock of allStocks) {
      promises.push(
        stockAPI.requestStockData(stock.symbol)
        .then(apiRes => {
          let symbol = apiRes["Meta Data"]["2. Symbol"].toUpperCase();
          let last_refreshed = apiRes["Meta Data"]["3. Last Refreshed"];
          let daily_data = [];
          // Format daily-data from object to array
          for(const [key, value] of Object.entries(apiRes["Time Series (Daily)"])) {
            // Round price to 2 decimals
            let close = Math.round(value["4. close"] * 100) / 100;
            daily_data.push({
              symbol: symbol,
              date: key,
              close: close
            });
          }
          allData.push({
            symbol: symbol,
            last_refreshed: last_refreshed,
            daily_data: daily_data
          });
        })
        .catch(err => {
          console.log(err);
          error = err;
        })
      );
    }

    // Run all promises
    Promise.all(promises)
    .then(() => {
      // Check if API request limit has been reached
      if (error === "") {
        res.json({
          success: true,
          all_daily_data: allData
        })
      } else {
        res.json({
          success: false,
          message: error
        });
      }
    })
  })
  .catch(err => console.log(err));
});

module.exports = chartStocksRoutes;