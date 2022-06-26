const express = require("express");

const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
    console.log("user joined channel " + channelId);
  });

  socket.on("leave-channel", (channelId) => {
    socket.leave(channelId);
    console.log("user left channel " + channelId);
  });

  socket.on("typing", (channelId, senderName) => {
    console.log("typing", channelId, senderName);
    socket.to(channelId).emit("typing", `${senderName} is typing...`);
  });

  socket.on("join-audio-room", (channelId, userId) => {
    socket.join("audio-" + channelId);
    console.log("user joined audio " + channelId);
    io.to("audio-" + channelId).emit(
      "user-joined-audio-room",
      userId,
      socket.id
    );
    socket.on("disconnect", () => {
      io.to("audio-" + channelId).emit("user-left-audio-room", userId);
    });
  });

  socket.on("user-in-room", (channelId, userId, socketId, userActive) => {
    console.log("other user in room", userId);
    socket.to(socketId).emit("other-user-in-room", userId, userActive);
  });

  socket.on("join-call", (channelId, userId, peerId) => {
    io.to("audio-" + channelId).emit(
      "user-joined-call",
      channelId,
      userId,
      peerId
    );

    // socket.on("disconnect", () => {
    //   socket.to("audio-" + channelId).emit("user-left-call", userId);
    // });
  });

  socket.on("leave-audio-room", (channelId, userId) => {
    socket.leave("audio-" + channelId);
    //  socket.removeAllListeners("disconnect");
    socket.to("audio-" + channelId).emit("user-left-audio-room", userId);
    console.log("user left audio " + channelId);
  });

  socket.on("leave-call", (channelId, userId, peerId) => {
    io.to("audio-" + channelId).emit(
      "user-left-call",
      channelId,
      userId,
      peerId
    );
  });

  socket.on("disconnet", () => {
    socket.removeAllListeners();
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log("listening on port:" + port);
});
