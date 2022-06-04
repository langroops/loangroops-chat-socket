const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join", (channelId) => {
    socket.join(channelId);
    console.log("user joined channel " + channelId);
  });

  socket.on("leave", (channelId) => {
    socket.leave(channelId);
    console.log("user left channel " + channelId);
  });

  socket.on("typing", (channelId, senderName) => {
    console.log("typing", channelId, senderName);
    socket.to(channelId).emit("typing", `${senderName} is typing...`);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
