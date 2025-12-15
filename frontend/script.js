const socket = io("http://localhost:3000");

const email = localStorage.getItem("email");
socket.emit("login", email);

const stockList = document.getElementById("stockList");
const stocks = {};

function subscribe() {
  const stock = document.getElementById("stockSelect").value;
  socket.emit("subscribe", stock);

  if (!stocks[stock]) {
    stocks[stock] = 0;
    const li = document.createElement("li");
    li.id = stock;
    li.innerText = `${stock}: --`;
    stockList.appendChild(li);
  }
}

// Receive real-time updates
socket.on("priceUpdate", (updates) => {
  updates.forEach(({ stock, price }) => {
    const li = document.getElementById(stock);
    if (li) {
      li.innerText = `${stock}: $${price}`;
    }
  });
});
