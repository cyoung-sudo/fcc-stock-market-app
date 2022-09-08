const axios = require("axios");

module.exports = {
  //----- Retrive stock data
  requestStockData: symbolToAdd => {
    return new Promise((resolve, reject) => {
      const apiEndpoint = "https://www.alphavantage.co";
      const params = `/query?function=TIME_SERIES_DAILY&symbol=${symbolToAdd}&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
  
      // Request stock data from API
      axios({
        method: "get",
        withCredentials: true,
        url: apiEndpoint + params,
      })
      .then(apiRes => {
        // Check for error message
        if(apiRes.data["Error Message"]) {
          //--- Invalid symbol
          reject("Invalid symbol");
        } else if(apiRes.data["Note"]) {
          //--- API request limit (5/min)
          reject("Limit reached: 5 requests per minute");
        } else {
          //--- Valid symbol
          resolve(apiRes.data);
        }
      })
      .catch(err => console.log(err));
    });
  }
};