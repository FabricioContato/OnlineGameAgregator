const client = require("./redis");

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

async function jsonStringIntoRedis(key, json) {
  const jsonStr = JSON.stringify(json);
  return await client.set(key, jsonStr);
}

async function getJsonFromJsonStringFromRedis(key) {
  //console.log('getJsonFromJsonStringFromRedis');
  const jsonStr = await client.get(key);
  return JSON.parse(jsonStr);
}

async function connection(socket, io) {
  console.log("connected");
  const room = socket.handshake.query.room;
  socket.join(room);

  let roomJson = await getJsonFromJsonStringFromRedis(room);
  if (!roomJson) {
    const startCellsRowsListStr = JSON.stringify(startCellsRowsList);
    roomJson = {
      cellsRows: startCellsRowsListStr,
      playerOfTheTurn: socket.id,
      players: [socket.id],
    };
    await jsonStringIntoRedis(room, roomJson);
    io.to(room).emit(
      "player-joins",
      roomJson.players,
      roomJson.playerOfTheTurn
    );
    return "";
  }

  if (roomJson.players.includes(socket.id)) {
    console.log("welcome back!");
    return "";
  }

  if (roomJson.players.length > 1) {
    console.log("full room. you was desconnected");
    //console.log(`${roomJson.players} ${ socket.id}`);
    socket.disconnect();
    return "";
  }

  roomJson.players.push(socket.id);
  await jsonStringIntoRedis(room, roomJson);
  io.to(room).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
}

async function ticTacToeSocketHandler(socket, io) {
  await connection(socket, io);

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
    const room = socket.handshake.query.room;

    const roomJson = await getJsonFromJsonStringFromRedis(room);
    const playerOfTheTurn = roomJson.playerOfTheTurn;
    //console.log(`requesting player: ${socket.id} ; player of the turn ${playerOfTheTurn}`);
    if (playerOfTheTurn !== socket.id) {
      console.log("not your turn");
      return "none";
    }

    const membersSet = io.sockets.adapter.rooms.get(room);
    const membersArray = Array.from(membersSet);

    if (membersArray.length <= 1) {
      console.log("wait for other player to join");
      return "none";
    }

    const rowIndex = Math.floor(cellId / 3);
    const cellIndex = cellId - rowIndex * 3;
    const cellsRowsStr = roomJson.cellsRows;
    //console.log(cellsRowsStr);
    const cellsRows = JSON.parse(cellsRowsStr);
    const currentCellCode = cellsRows[rowIndex][cellIndex].imageSimbleCode;
    if (["x", "circle"].includes(currentCellCode)) {
      console.log(`you can't click at cell: ${cellId}`);
      return "none";
    }

    const callback = (id) => id === socket.id;
    const playerNumber = membersArray.findIndex(callback) + 1;
    const newImageSimbleCode = playerNumber === 1 ? "x" : "circle";

    cellsRows[rowIndex][cellIndex].imageSimbleCode = newImageSimbleCode;
    const newCellsRoowsStr = JSON.stringify(cellsRows);
    roomJson.cellsRows = newCellsRoowsStr;

    const callback_ = (id) => id !== socket.id;
    const newPlayerOfTheTurn = membersArray.find(callback_);
    roomJson.playerOfTheTurn = newPlayerOfTheTurn;

    await jsonStringIntoRedis(room, roomJson);

    io.to(room).emit("player-click", cellsRows, newPlayerOfTheTurn);
  });

  socket.on("am-I-first-to-play", async () => {
    const room = socket.handshake.query.room;
    const roomJson = await getJsonFromJsonStringFromRedis(room);
    socket.emit("am-I-first-to-play", roomJson.players[0]);
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
}

exports.ticTacToeSocketHandler = ticTacToeSocketHandler;