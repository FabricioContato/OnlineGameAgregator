const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
app.use(cors());
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Socket } = require("node:dgram");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:2000"]
  },
});

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});

io.on("connection", (socket) => {
  console.log("connected");
  socket.join(socket.handshake.room);

  socket.on("disconnect", () => {
    console.log("diconnected");
  });

  socket.on("player-click", (cellId) =>{
    const membersSet = io.sockets.adapter.rooms.get(socket.handshake.room);
    const membersArray = Array.from(membersSet);
    const callback = (id) => id === socket.id;
    const playerNumber = membersArray.findIndex(callback) + 1;
    const simble = playerNumber === 1 ? "x" : "circle";
    const callback_ = (id) => id !== socket.id;
    const playerOfTheTurnId = membersArray.find(callback_);

    io.emit("player-click", cellId, simble, playerOfTheTurnId);
  });

  socket.on("am-I-first-to-play", () => {
    const membersSet = io.sockets.adapter.rooms.get(socket.handshake.room);
    const membersArray = Array.from(membersSet);
    const callback = (id) => id === socket.id;
    const playerNumber = membersArray.findIndex(callback) + 1;
    const anwser = playerNumber === 1;

    socket.emit("am-I-first-to-play", anwser);
  });

  socket.on("newRoom", (newRoomJson, callback) => {
    //console.log(newRoomJson);
    const roomArray = Array.from(io.sockets.adapter.rooms.keys());
    const valueArray = Array.from(io.sockets.adapter.rooms.values());
    
    //console.log(roomArray);
    //console.log(valueArray);
    if (roomArray.includes(newRoomJson.roomCode)) {

      callback({
        status: "Room code already in use",
      });
    } else {
      socket.join(newRoomJson.roomCode);
      //console.log(io.sockets.adapter.rooms.keys());
      callback({
        status: "created",
      });
    }

    console.log(io.sockets.adapter.rooms);
  });

  
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
