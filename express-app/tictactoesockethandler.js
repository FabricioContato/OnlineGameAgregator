const { json } = require("body-parser");
const {client, jsonStringIntoRedis, getJsonFromJsonStringFromRedis} = require("./redis");

// Auxiliar funtions and consts

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

async function getNewStartCellsRowsList(){
  return JSON.parse(JSON.stringify(startCellsRowsList));
}

async function userNameBySimble(simble, players){
  return simble === 'x' ? players[0].userName : players[1].userName; 
}

async function winCondition(cellsRows, players){

  //possible win combinations
  const auxArr = [
    [cellsRows[0][0].imageSimbleCode, cellsRows[0][1].imageSimbleCode, cellsRows[0][2].imageSimbleCode], //horizontal win combinations
    [cellsRows[1][0].imageSimbleCode, cellsRows[1][1].imageSimbleCode, cellsRows[1][2].imageSimbleCode],
    [cellsRows[2][0].imageSimbleCode, cellsRows[2][1].imageSimbleCode, cellsRows[2][2].imageSimbleCode],
    [cellsRows[0][0].imageSimbleCode, cellsRows[1][0].imageSimbleCode, cellsRows[2][0].imageSimbleCode], //vertical win combinations
    [cellsRows[0][1].imageSimbleCode, cellsRows[1][1].imageSimbleCode, cellsRows[2][1].imageSimbleCode],
    [cellsRows[0][2].imageSimbleCode, cellsRows[1][2].imageSimbleCode, cellsRows[2][2].imageSimbleCode],
    [cellsRows[0][0].imageSimbleCode, cellsRows[1][1].imageSimbleCode, cellsRows[2][2].imageSimbleCode], //diagonal win combinations
    [cellsRows[0][2].imageSimbleCode, cellsRows[1][1].imageSimbleCode, cellsRows[2][0].imageSimbleCode]
  ]

  for(let arr of auxArr){
    if(arr.includes("blank")){
      continue;
    }

    if(arr.includes("circle") && !arr.includes("x")){
      return await userNameBySimble("circle", players);
    }

    if(arr.includes("x") && !arr.includes("circle")){
      return await userNameBySimble("x", players);
    }
  }

  //no winner yet!
  return false;

}


async function createNewTictactoeRoom(roomCode){
    roomJson = {
      roomType: "tic-tac-toe",
      cellsRows: await getNewStartCellsRowsList(),
      playerOfTheTurn: null,
      players: [],
      playersReady: [],
      state: "pre-start"
    };
    await jsonStringIntoRedis(roomCode, roomJson);

}

async function getRandomPlayerOfTheTurn(players){
  const index = Math.floor(Math.random() * players.length);
  return players[index].userName;
}

async function getPlayerSimble(arr, userName){
  if(arr[0].userName == userName){
    return 'x';
  }

  if(arr[1].userName == userName){
    return 'circle';
  }
}

async function getNextPlayerOfTheTurn(players, currentPlayerOfTheTurn){
  if(players[0].userName === currentPlayerOfTheTurn){
    return players[1].userName;
  }

  if(players[1].userName === currentPlayerOfTheTurn){
    return players[0].userName;
  }
}

async function removePlayerByUsername(arr ,userName){
  for(i in arr){
    if(arr[i].userName === userName){
      arr.splice(i,1);
    }
  }
  return arr;
}

async function numberOfReadyPlayers(arr){
  let counter = 0;
  for(player of arr){
    if(player.state === "READY"){
      counter = counter + 1;
    }
  }

  return counter;
}

async function getPlayerStateByUsername(arr, userName){
  for(player of arr){
    if(player.userName == userName){
      return player.state;
    }
  }

  return null;
}

async function setPlayersSatate(arr, state){
  for(i in arr){
    arr[i].state = state;
  }

  return arr;
}

async function setPlayerSatate(arr ,userName, state){
  for(i in arr){
    if(arr[i].userName === userName){
      arr[i].state = state;
    }
  }

  return arr;
}

async function getPlayerByUsername(arr, userName){
  for(player of arr){
    if(player.userName === userName){
      return player
    }
  }

  return false;
}

async function isPlayerAFKByUsername(arr, userName){
  for(player of arr){
    if(player.state === "AFK" && player.userName === userName){
      return true;
    }
  }

  return false;
}

async function tictactoeConnectionValidator(roomCode, newUsername){
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  if(!roomJson){
    return {erro: true, status: 404, message: `Room ${roomCode} not found!`};
  }

  if(roomJson.players.length === 2){

    if(await isPlayerAFKByUsername(roomJson.players, newUsername)){
      return {erro: false, status: 200, message: "AFK user waiting for reconnection!"};
    }

    return {erro: true, status: 409, message: "The Room is full"};
  }

  if(await getPlayerByUsername(roomJson.players, newUsername)){
    return {erro: true, status: 409, message: "Nickname is already in use!"}
  }

  return {erro: false, status: 200, message: ''};
}

async function addNewPlayer(roomCode, newUserName){
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  const newPlayer = {userName: newUserName, state: "CONNECTING"};
  roomJson.players.push(newPlayer);
  if(roomJson.players.length === 1){
    roomJson.playerOfTheTurn = newUserName;
    //await jsonStringIntoRedis(roomCode, roomJson);
  }
  await jsonStringIntoRedis(roomCode, roomJson);
  /* else{
    await jsonStringIntoRedis(roomCode, roomJson);
    io.to(roomCode).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  } */

  return roomJson;

}

async function connection(socket, io) {
  const room = socket.handshake.query.room;
  const userName = socket.handshake.query.userName;
  const roomJson = await getJsonFromJsonStringFromRedis(room, userName);

  if(!roomJson){
    socket.disconnect();
    return null;
  }

  const playerState = await getPlayerStateByUsername(roomJson.players, userName);

  if(playerState === "CONNECTING"){
    roomJson.players = await setPlayerSatate(roomJson.players, userName, "UN-READY");
  } else if(playerState === "AFK"){
    roomJson.players = await setPlayerSatate(roomJson.players, userName, "READY");
  }
  await jsonStringIntoRedis(room, roomJson);
  socket.join(room);
  io.to(room).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  return true;
}

async function ticTacToeSocketHandler(socket, io) {
  const connectionStatus = await connection(socket, io);

  if(! connectionStatus){
    return null;
  }

  async function disconnect(){

    const room = socket.handshake.query.room;
  
    const sockerIdMembersSet = io.sockets.adapter.rooms.get(room);
    if (!sockerIdMembersSet) {
      await client.del(room);
      return null;
    }
  
    const userName = socket.handshake.query.userName;
    const roomJson = await getJsonFromJsonStringFromRedis(room);
  
    if(roomJson.state !== "started"){
       const newArr = await removePlayerByUsername(roomJson.players, userName);
       roomJson.players = newArr;
  
      if(roomJson.playerOfTheTurn === userName){
        roomJson.playerOfTheTurn = roomJson.players[0].userName;
      }
  
    }
    else
    {
      roomJson.players = await setPlayerSatate(roomJson.players, userName, "AFK");
    }

    await jsonStringIntoRedis(room, roomJson);
    io.to(room).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  
  }
  socket.on("disconnect", disconnect);

  async function playerClick(cellId){
    const room = socket.handshake.query.room;
  
    const roomJson = await getJsonFromJsonStringFromRedis(room);
  
    if(roomJson.state !== "started"){
      return null;
    }
  
    const userName = socket.handshake.query.userName;

    const playerOfTheTurn = roomJson.playerOfTheTurn;

    if(playerOfTheTurn !== userName) {
      return "none";
    }
  
    const rowIndex = Math.floor(cellId / 3);
    const cellIndex = cellId - rowIndex * 3;
    const cellsRows = roomJson.cellsRows;
    const currentCellCode = cellsRows[rowIndex][cellIndex].imageSimbleCode;
    if (["x", "circle"].includes(currentCellCode)) {
      return "none";
    }
  
    const newImageSimbleCode = await getPlayerSimble(roomJson.players, userName);
  
    cellsRows[rowIndex][cellIndex].imageSimbleCode = newImageSimbleCode;
    const newCellsRoows = cellsRows;
    roomJson.cellsRows = newCellsRoows;
  
    const winnerPlayer = await winCondition(newCellsRoows, roomJson.players);
  
    const newPlayerOfTheTurn = await getNextPlayerOfTheTurn(roomJson.players, roomJson.playerOfTheTurn);
    roomJson.playerOfTheTurn = newPlayerOfTheTurn; 
  
    
    //state: "pre-start"
    if(winnerPlayer){
      roomJson.state = "finished";
      roomJson.players = await setPlayersSatate(roomJson.players, "UN-READY");
      roomJson.cellsRows = await getNewStartCellsRowsList();
      roomJson.playerOfTheTurn = await getRandomPlayerOfTheTurn(roomJson.players);
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("winner-player", newCellsRoows, winnerPlayer, roomJson.state, roomJson.players);
    }
    else{
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("player-click", newCellsRoows, newPlayerOfTheTurn);
    }
  }
  socket.on("player-click", playerClick);

  async function ready(){
    const room = socket.handshake.query.room;
    const userName = socket.handshake.query.userName;
  
    const roomJson = await getJsonFromJsonStringFromRedis(room);
    if(await getPlayerStateByUsername(roomJson.players, userName) === "READY" ){
      socket.emit("ready", roomJson.players);
      return null;
    }
  
    roomJson.players = await setPlayerSatate(roomJson.players, userName, "READY");
    
    if(await numberOfReadyPlayers(roomJson.players) === 2){
      roomJson.state = "started";
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("ready", roomJson.players);
      io.to(room).emit("start-game",roomJson.cellsRows, roomJson.playerOfTheTurn , roomJson.state);
    }else{
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("ready", roomJson.players);
    }
  
  }
  socket.on("ready", ready);
}

module.exports = {
                  ticTacToeSocketHandler: ticTacToeSocketHandler,
                  createNewTictactoeRoom: createNewTictactoeRoom,
                  tictactoeConnectionValidator: tictactoeConnectionValidator,
                  addNewPlayer: addNewPlayer
};