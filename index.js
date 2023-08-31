const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname + "/client/build"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/client/build/index.html");
});

const users = {};

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("userJoined", Object.values(users));
    socket.emit("message", `Welcome to the chat, ${username}!`);
  });

  socket.on("message", (message) => {
    io.emit("message", `${users[socket.id]}: ${message}`);
  });

  socket.on("privateMessage", ({ to, message }) => {
    const sender = users[socket.id];
    const recipientSocket = Object.keys(users).find(
      (socketId) => users[socketId] === to
    );
    if (recipientSocket) {
      io.to(recipientSocket).emit("message", `${sender} (private): ${message}`);
      io.to(socket.id).emit(
        "message",
        `${sender} (private to ${to}): ${message}`
      );
    }
  });

  socket.on("disconnect", () => {
    const userLeft = users[socket.id];
    delete users[socket.id];
    const onlineUsernames = Object.values(users);
    io.emit("userLeft", onlineUsernames);
    console.log(`${userLeft} left the chat`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
