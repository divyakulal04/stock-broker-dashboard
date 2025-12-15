const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Supported stocks
const STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];

// Store user subscriptions
const userSubscriptions = {};

// Generate random price
function randomPrice() {
  return (Math.random() * 1000 + 100).toFixed(2);
}

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("login", (email) => {
    userSubscriptions[socket.id] = {
      email,
      stocks: []
    };
  });

  socket.on("subscribe", (stock) => {
    if (
      STOCKS.includes(stock) &&
      !userSubscriptions[socket.id].stocks.includes(stock)
    ) {
      userSubscriptions[socket.id].stocks.push(stock);
    }
  });

  socket.on("disconnect", () => {
    delete userSubscriptions[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

// Update stock prices every second
setInterval(() => {
  Object.keys(userSubscriptions).forEach((socketId) => {
    const user = userSubscriptions[socketId];
    if (!user) return;

    const updates = user.stocks.map((stock) => ({
      stock,
      price: randomPrice()
    }));

    io.to(socketId).emit("priceUpdate", updates);
  });
}, 1000);

// Start server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

