import './Chart.css';
import axios from 'axios';
// React
import { useState } from 'react';
// Chart
import { 
  ResponsiveContainer,
  LineChart,
  Line, 
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label
} from 'recharts';
// Icons
import { BsTrashFill } from 'react-icons/bs';

export default function Chart(props) {
  const [ stockToAdd, setStockToAdd ] = useState("");
  const [ chartStocks, setChartStocks ] = useState([]);
  // Messages
  const [message, setMessage] = useState("");

  //----- Handle form for adding stocks to chart
  const handleAddStock = e => {
    // Prevent refresh on submit
    e.preventDefault();
    // Get existing stock tickers
    let existingStocks = chartStocks.map(stock => {
      return stock[0].ticker
    });
    //Check for duplicate stock
    if(existingStocks.includes(stockToAdd.toUpperCase())) {
      displayMessage("Error: Duplicate stock");
    } else {
      // Send form data to server
      axios({
        method: "post",
        data: { ticker: stockToAdd },
        withCredentials: true,
        url: "/api/stockApi/addStock"
      }).then((res) => {
        if(res.data.success) {
          let formattedStockData = formatStockData(res.data.data);
          // Add stock data to chart
          setChartStocks(state => [...state, formattedStockData]);
        } else {
          displayMessage(res.data.message);
        }
      })
      .catch(err => console.log(err));
    }
  };

  // Handle removing stocks from chart
  const handleRemoveStock = ticker => {
    let chartStocksCopy = [...chartStocks];
    chartStocksCopy= chartStocksCopy.filter(stock => {
      return stock[0].ticker !== ticker
    });
    setChartStocks(chartStocksCopy);
  };

  // Format stock data for chart
  const formatStockData = stockData => {
    let result = [];
    // Uppercase ticker
    let ticker = stockData["Meta Data"]["2. Symbol"].toUpperCase();
    // Format data
    for(const [key, value] of Object.entries(stockData["Time Series (Daily)"])) {
      // Round price to 2 decimals
      let roundedClose = Math.round(value["4. close"] * 100) / 100;
      result.push({
        ticker: ticker,
        date: key,
        close: roundedClose
      });
    }
    return result;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div id="chart-chart-tooltip">
          <strong>{payload[0].payload.date}</strong>
          {payload.map((stock, idx) => (
            <p key={idx}>{stock.payload.ticker}: ${stock.payload.close}</p>
          ))}
        </div>
      );
    }
  };

  // Display message window
  const displayMessage = message => {
    setMessage(message);
    // Scroll to top of page
    window.scrollTo(0, 0);
  };

  return (
    <div id="chart">
      {message && 
        <div id="chart-message">
          <div>{message}</div>
        </div>
      }

      <div id="chart-header">
        <h1>Daily Chart</h1>
      </div>

      <div id="chart-remove">
        {chartStocks && chartStocks.map((stock, idx) => (
          <button key={idx} onClick={() => handleRemoveStock(stock[0].ticker)}>
            {stock[0].ticker}<span><BsTrashFill/></span>
          </button>
        ))}
      </div>

      {/* Chart to display stock data */}
      <div id="chart-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            {chartStocks && chartStocks.map((stock, idx) => (
              <Line 
                key={idx}
                data={stock}
                type="monotone"
                dataKey="close"
                stroke="#8884d8" />
            ))}
            <CartesianGrid stroke="#ccc" />
            <XAxis 
              dataKey="date"
              interval={5}
              allowDuplicatedCategory={false}
              height={120}
              angle={-70}
              dx={-20}
              dy={40}>
              <Label
                value="Date" 
                position="insideBottom"/>
            </XAxis>
            <YAxis 
              tickCount={10}
              width={80}>
              <Label
                value="Price (USD)" 
                angle={-90}
                position="insideLeft"/>
            </YAxis>
            <Tooltip content={<CustomTooltip/>}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* /Chart to display stock data */}

      {/* Form to add stock to chart */}
      <form id="chart-form" onSubmit={handleAddStock}>
        <div id="chart-form-field">
          <label>Ticker</label>
          <input type="text" onChange={e => setStockToAdd(e.target.value)} placeholder="ticker"/>
        </div>

        <div id="chart-form-submit">
          <input type="submit" value="Submit"/>
        </div>
      </form>
      {/* /Form to add stock to chart */}
    </div>
  );
};