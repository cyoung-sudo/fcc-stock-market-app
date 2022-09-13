import './Chart.css';
import axios from 'axios';
// React
import { useState, useEffect } from 'react';
// Socket
import { io } from 'socket.io-client';
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
import { AiOutlineLineChart, AiOutlineClose } from 'react-icons/ai';
import { BsFillSquareFill } from 'react-icons/bs';

// Connect to server (proxy server path)
const socket = io();

export default function Chart(props) {
  const [ stockToAdd, setStockToAdd ] = useState("");
  const [ chartStocks, setChartStocks ] = useState([]);
  // Messages
  const [message, setMessage] = useState("");
  // Manual refresh
  const [refresh, setRefresh] = useState(false);

  //----- Retrieve updated stock data
  useEffect(() => {
    axios({
      method: "get",
      withCredentials: true,
      url: "/api/chartStocks/existingStocks"
    }).then(res => {
      if(res.data.success) {
        setChartStocks([...res.data.all_daily_data]);
        // Scroll to top of page
        window.scrollTo(0, 0);
      } else {
        displayMessage(res.data.message);
      }
    })
    .catch(err => console.log(err));
  }, [refresh]);

  //----- Retrieve updated stock data on socket event
  useEffect(() => {
    socket.on("update_stocks", () => {
      axios({
        method: "get",
        withCredentials: true,
        url: "/api/chartStocks/existingStocks"
      }).then(res => {
        if(res.data.success) {
          setChartStocks([...res.data.all_daily_data]);
        } else {
          displayMessage(res.data.message);
        }
      })
      .catch(err => console.log(err));
    });
  }, [socket]);

  //----- Handle form for adding stocks to chart
  const handleAddStock = e => {
    // Prevent refresh on submit
    e.preventDefault();
    // Send form data to server
    axios({
      method: "post",
      data: { symbol: stockToAdd },
      withCredentials: true,
      url: "/api/chartStocks/addStock"
    }).then(res => {
      if(res.data.success) {
        // Refresh component
        setRefresh(refresh => !refresh);
        // Notify server of new stock addition
        socket.emit("stocks_updated");
      } else {
        displayMessage(res.data.message);
      }
    })
    .catch(err => console.log(err));
  };

  // Handle removing stocks from chart
  const handleRemoveStock = symbol => {
    // Send data to server
    axios({
      method: "delete",
      data: { symbol: symbol },
      withCredentials: true,
      url: "/api/chartStocks/removeStock"
    }).then(res => {
      if(res.data.success) {
        // Refresh component
        setRefresh(refresh => !refresh);
        // Notify server of stock updates
        socket.emit("stocks_updated");
      }
    })
    .catch(err => console.log(err));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div id="chart-chart-tooltip">
          <strong>{payload[0].payload.date}</strong>
          {payload.map((stock, idx) => (
            <p key={idx}>
              <span style={{color: lineColors[idx]}}><BsFillSquareFill/></span>{stock.payload.symbol}: ${stock.payload.close}
            </p>
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

  // Chart line colors
  const lineColors = ["dodgerblue", "crimson"];

  return (
    <div id="chart">
      {message && 
        <div id="chart-message">
          <div>{message}</div>
        </div>
      }

      <div id="chart-header">
        <h1>
          <span><AiOutlineLineChart/></span>Daily Chart
        </h1>
      </div>

      {/* Stock removal buttons */}
      {(chartStocks.length > 0) && <div id="chart-remove">
        {chartStocks.map((stock, idx) => (
          <button 
            key={idx} 
            onClick={() => handleRemoveStock(stock.symbol)}
            style={{backgroundColor: lineColors[idx]}}>
            {stock.symbol}<span className="chart-remove-icon"><AiOutlineClose/></span>
          </button>
        ))}
      </div>}
      {/* /Stock removal buttons */}
  
      {/* Chart to display stock data */}
      {(chartStocks.length > 0) && <div id="chart-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            {chartStocks.map((stock, idx) => (
              <Line 
                key={idx}
                data={stock.daily_data}
                type="monotone"
                dataKey="close"
                stroke={lineColors[idx]}
                dot={false} />
            ))}
            <CartesianGrid stroke="#ccc" />
            <XAxis 
              dataKey="date"
              interval={5}
              allowDuplicatedCategory={false}
              height={95}
              angle={-70}
              dx={-15}
              dy={30}
              tick={{fontSize: 12}}
              reversed>
              <Label
                value="Date" 
                position="insideBottom"
                dx={-10}/>
            </XAxis>
            <YAxis 
              domain={[dataMin => Math.floor(dataMin), dataMax => Math.round(dataMax)]}
              tickCount={10}
              width={50}
              tick={{fontSize: 12}}>
              <Label
                value="Price (USD)" 
                angle={-90}
                position="insideLeft"
                dy={35}/>
            </YAxis>
            <Tooltip content={<CustomTooltip/>}/>
          </LineChart>
        </ResponsiveContainer>
      </div>}
      {/* /Chart to display stock data */}

      {/* Display when chart is empty */}
      {(chartStocks.length === 0) && <div id="chart-empty">
        <h3>No stocks to display</h3>
      </div>}
      {/* /Display when chart is empty */}

      {/* Form to add stock to chart */}
      <form id="chart-form" onSubmit={handleAddStock}>
        <div id="chart-form-field">
          <input type="text" onChange={e => setStockToAdd(e.target.value)} placeholder="symbol"/>
        </div>

        <div id="chart-form-submit">
          <input type="submit" value="Add Stock"/>
        </div>
      </form>
      {/* /Form to add stock to chart */}
    </div>
  );
};