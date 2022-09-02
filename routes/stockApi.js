const express = require("express");
const axios = require("axios");

const stockApiRoutes = express.Router();

//----- Retrive ticker data & add to chart
stockApiRoutes.post("/api/stockApi/addStock", (req, res) => {
  const apiEndpoint = "https://www.alphavantage.co";
  const params = `/query?function=TIME_SERIES_DAILY&symbol=${req.body.ticker}&apikey=${process.env.ALPHA_VANTAGE_KEY}`;

  // Request stock data from API
  axios({
    method: "get",
    withCredentials: true,
    url: apiEndpoint + params,
  })
  .then(apiRes => {
    // Check for error message
    if(apiRes.data["Error Message"]) {
      //--- Valid ticker
      res.json({ 
        success: false,
        message: "Invalid ticker"
      });
    } else {
      //--- Invalid ticker
      res.json({ success: true });
      // Add stock to chart...
    }
  })
  .catch(err => console.log(err));
});

module.exports = stockApiRoutes;