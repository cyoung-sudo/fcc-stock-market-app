//----- Imports
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const db = require("./db/conn");
// Socket.io
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

//----- Middleware
app.use(cors());
app.use(express.json());

//----- Routes
app.use(require("./routes/chartStocks"));

//----- Socket events
io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);
  // Listen for stock updates
  socket.on('stocks_updated', () => {
    // Other sockets: request for the updated "stocks"
    socket.broadcast.emit('update_stocks');
  });
});

//----- Deployment settings
if(process.env.NODE_ENV === 'production') {
  // Serve static files from the client folder
  app.use(express.static('client/build'));
  // Load the React "index" for any "GET" routes not defined above
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
 
//----- Connection
const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  // Perform DB connection when server starts
  db.connect();
  console.log(`Server is running on port: ${port}`);
});