const { json } = require("body-parser");
const {client, jsonStringIntoRedis, getJsonFromJsonStringFromRedis} = require("./redis");

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

async function createNewTictactoeRoom(roomCode){
    roomJson = {
      roomType: "tic-tac-toe",
      cellsRows: startCellsRowsList,
      playerOfTheTurn: null,
      players: [],
      state: "pre-start"
    };
    await jsonStringIntoRedis(roomCode, roomJson);

}


async function connection(socket, io) {
  const room = socket.handshake.query.room;
  const userName = socket.handshake.query.userName;
  socket.join(room);

  let roomJson = await getJsonFromJsonStringFromRedis(room);
  if(!roomJson){
    socket.disconnect();
    return false;
  }

  console.log(`tic-tac-toe connection event; redis anwser from key ${room}: ${JSON.stringify(roomJson)}` )
  /* if (!roomJson) {
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
  } */

  if (roomJson.players.includes(userName)) {
    console.log("connected");
    console.log("welcome back!");
    return true;
  }

  if (roomJson.players.length >= 2) {
    console.log("full room. you was desconnected");
    //console.log(`${roomJson.players} ${ socket.id}`);
    socket.disconnect();
    return false;
  }

  roomJson.players.push(userName);

  if(! roomJson.playerOfTheTurn){
    roomJson.playerOfTheTurn = userName;
  }
  await jsonStringIntoRedis(room, roomJson);
  io.to(room).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  console.log("connected");
  return true;
}

async function ticTacToeSocketHandler(socket, io) {
  const connectionStatus = await connection(socket, io);

  if(! connectionStatus){
    return null;
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
    const room = socket.handshake.query.room;
    const userName = socket.handshake.query.userName;

    const roomJson = await getJsonFromJsonStringFromRedis(room);
    const playerOfTheTurn = roomJson.playerOfTheTurn;
    //console.log(`requesting player: ${socket.id} ; player of the turn ${playerOfTheTurn}`);
    if (playerOfTheTurn !== userName) {
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
    //console.log(cellsRowsStr);
    const cellsRows = roomJson.cellsRows;
    const currentCellCode = cellsRows[rowIndex][cellIndex].imageSimbleCode;
    if (["x", "circle"].includes(currentCellCode)) {
      console.log(`you can't click at cell: ${cellId}`);
      return "none";
    }

    const playersUserNames = roomJson.players;

    const callback = (userName_) => userName_ === userName;
    const playerNumber = playersUserNames.findIndex(callback) + 1;
    const newImageSimbleCode = playerNumber === 1 ? "x" : "circle";

    cellsRows[rowIndex][cellIndex].imageSimbleCode = newImageSimbleCode;
    const newCellsRoows = cellsRows;
    roomJson.cellsRows = newCellsRoows;

    const callback_ = (userName_) => userName_ !== userName;
    const newPlayerOfTheTurn = playersUserNames.find(callback_);
    roomJson.playerOfTheTurn = newPlayerOfTheTurn;

    await jsonStringIntoRedis(room, roomJson);

    io.to(room).emit("player-click", newCellsRoows, newPlayerOfTheTurn);
  });

  socket.on("am-I-first-to-play", async () => {
    const room = socket.handshake.query.room;
    const roomJson = await getJsonFromJsonStringFromRedis(room);
    socket.emit("am-I-first-to-play", roomJson.players[0]);
  });

  socket.on("start-game", async () => {
    const room = socket.handshake.query.room;
    const roomJson = await getJsonFromJsonStringFromRedis(room);
    //console.log(`tic-tac-toe start-game event; redis anwser from key ${room}: ${JSON.stringify(roomJson)}` )
    roomJson.state = "started";
    await jsonStringIntoRedis(room, roomJson);

    socket.emit("start-game", roomJson.state);
    
    
  });
}

module.exports = {
                  ticTacToeSocketHandler: ticTacToeSocketHandler,
                  createNewTictactoeRoom: createNewTictactoeRoom
};