//----- Imports
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const db = require("./db/conn");

//----- Middleware
app.use(cors());
app.use(express.json());

//----- Routes
app.use(require("./routes/stockApi"));
 
//----- Connection
const port = process.env.PORT || 5000;
app.listen(port, () => {
  // Perform DB connection when server starts
  db.connect();
  console.log(`Server is running on port: ${port}`);
});