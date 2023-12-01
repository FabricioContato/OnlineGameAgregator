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
    origin: ["http://localhost:3000", "http://localhost:2000"],
  },
});

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});

const startCellsRowsList = [
  [
    { id: 0, imageSimbleCode: "blank" },
    { id: 1, imageSimbleCode: "blank" },
    { id: 2, imageSimbleCode: "blank" },
  ],
  [
    { id: 3, imageSimbleCode: "blank" },
    { id: 4, imageSimbleCode: "blank" },
    { id: 5, imageSimbleCode: "blank" },
  ],
  [
    { id: 6, imageSimbleCode: "blank" },
    { id: 7, imageSimbleCode: "blank" },
    { id: 8, imageSimbleCode: "blank" },
  ],
];
io.on("connection", async (socket) => {
  console.log("connected");
  const room = socket.handshake.query.room;
  socket.join(room);

  const roomAlreadyExists = await client.get(room);
  if (!roomAlreadyExists) {
    const startCellsRowsListStr = JSON.stringify(startCellsRowsList);
    await client.set(room, startCellsRowsListStr);
    await client.set('playerOfTheTurn', socket.id);
  }

  socket.on("disconnect", async () => {
    console.log("diconnected");
    const room = socket.handshake.query.room;
    const membersSet = io.sockets.adapter.rooms.get(room);
    if (!membersSet) {
      await client.del(room);
      console.log("room key deleted from redis");
    }
  });

  socket.on("player-click", async (cellId) => {

    const playerOfTheTurn = await client.get("playerOfTheTurn");
    if(playerOfTheTurn !== socket.id){
      console.log("not your turn");
      return 'none';
    }

    const room = socket.handshake.query.room;
    const membersSet = io.sockets.adapter.rooms.get(room);
    const membersArray = Array.from(membersSet);

    if(membersArray.length <= 1 ){
      console.log("wait for other player to join");
      return 'none';
    }

    const rowIndex = Math.floor(cellId / 3);
    const cellIndex = cellId - rowIndex * 3;
    const cellsRowsStr = await client.get(room)
    //console.log(cellsRowsStr);
    const cellsRows = JSON.parse(cellsRowsStr);
    const currentCellCode = cellsRows[rowIndex][cellIndex].imageSimbleCode
    if(['x', 'circle'].includes(currentCellCode)){
      console.log(`you can't click at cell: ${cellId}` );
      return 'none';
    }
    
    const callback = (id) => id === socket.id;
    const playerNumber = membersArray.findIndex(callback) + 1;
    const newImageSimbleCode = playerNumber === 1 ? "x" : "circle";
    
    cellsRows[rowIndex][cellIndex].imageSimbleCode = newImageSimbleCode;
    const newCellsRoowsStr = JSON.stringify(cellsRows);
    await client.set(room, newCellsRoowsStr);

    const callback_ = (id) => id !== socket.id;
    const newPlayerOfTheTurn = membersArray.find(callback_);

    await client.set("playerOfTheTurn", newPlayerOfTheTurn);

    io.to(room).emit("player-click", cellsRows, newPlayerOfTheTurn);
  });

  socket.on("am-I-first-to-play", () => {
    const membersSet = io.sockets.adapter.rooms.get(
      socket.handshake.query.room
    );
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
