import './Chart.css';
import axios from 'axios';
// React
import { useState } from 'react';

export default function Chart(props) {
  const [ stockToAdd, setStockToAdd ] = useState("");

  //----- Handle form for adding stocks to chart
  const handleAddStock = e => {
    // Prevent refresh on submit
    e.preventDefault();
    // Send form data to server
    axios({
      method: "post",
      data: { ticker: stockToAdd },
      withCredentials: true,
      url: "/api/stockApi/addStock"
    }).then((res) => {
      console.log(res.data);
    })
    .catch(err => console.log(err));
  };

  return (
    <div id="chart">
      <div id="chart-header">
        <h1>Chart</h1>
      </div>

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