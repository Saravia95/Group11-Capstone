require("dotenv").config(); // Load env variables

// const authenticateToken = require("./authenticateToken");
// const authorizeRole = require("./authorizeRole");

const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // The origin (i.e., your frontend URL, e.g., Vite dev server)
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;
const SOCKET_SERVER_URL =
  process.env.SOCKET_SERVER_URL || "http://localhost:3000";

app.use(express.json()); // Necessary for parsing JSON request bodies

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Server logic...
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("serverMessage", "Hello, SocketID: " + socket.id + "!");

  socket.on("clientMessage", (data) => {
    console.log("Client message: ", data);
  });

  // Socket events...
});

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
