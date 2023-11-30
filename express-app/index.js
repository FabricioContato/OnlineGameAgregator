const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
app.use(cors());

const client = require("./redis");

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

io.on("connection", async (socket) => {
  console.log("connected");
  const room = socket.handshake.query.room;
  const str_ = JSON.stringify([{fild1: 1, fild2: 2}, {fild1: 3, fild2: 4}]);
  socket.join(room);
  await client.set(room, str_);

  socket.on("disconnect", async () => {
    console.log("diconnected");
    const room = socket.handshake.query.room;
    const membersSet = io.sockets.adapter.rooms.get(room);
    if (!membersSet){
      await client.del(room);
      console.log("room key deleted from redis");
    }
  });

  socket.on("player-click", async (cellId) =>{

    //const room = socket.handshake.query.room;
    //console.log( await client.get(room));
    const room = socket.handshake.query.room
    const membersSet = io.sockets.adapter.rooms.get(room);
    const membersArray = Array.from(membersSet);
    const callback = (id) => id === socket.id;
    const playerNumber = membersArray.findIndex(callback) + 1;
    const simble = playerNumber === 1 ? "x" : "circle";
    const callback_ = (id) => id !== socket.id;
    const playerOfTheTurnId = membersArray.find(callback_);

    io.to(room).emit("player-click", cellId, simble, playerOfTheTurnId);
  });

  socket.on("am-I-first-to-play", () => {
    const membersSet = io.sockets.adapter.rooms.get(socket.handshake.query.room);
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
