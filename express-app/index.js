const path = require('path');
const express = require("express");
const app = express();
const PORT = 80;
const cors = require("cors");
app.use(cors());
const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));

const {client, jsonStringIntoRedis, getJsonFromJsonStringFromRedis} = require("./redis");


const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Socket } = require("node:dgram");
const server = createServer(app);
const json_ = process.env.NODE_ENV === "development" ? {cors: {origin: ["http://localhost:3000", "http://localhost:2000"],},} : {};
console.log(process.env.NODE_ENV);
const io = new Server(server, json_);
const {ticTacToeSocketHandler, createNewTictactoeRoom, tictactoeConnectionValidator, addNewPlayer} = require("./tictactoesockethandler");
const {createNewCheckersRoom, checkersConnectionValidator, checkersSocketHandler} = require("./checkerssockethandler.js");

const CONFLICT_STATUS = 409;
const OK_STATUS = 200;
const NOT_FOUND_STATUS = 404;

const buildPath = path.join(__dirname, 'my-app/build');
app.use(express.static(buildPath));

app.post("/newRoom", async (req, res) => {
  const body = req.body;
  const roomCode = body.roomCode;
  const roomType = body.roomType;
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);

  if(roomJson){
    res.sendStatus(CONFLICT_STATUS).end();

  }else if(roomType === "Tic-Tac-Toe"){
    await createNewTictactoeRoom(roomCode);
    res.sendStatus(OK_STATUS).end();
  }
  else if(roomType == "Checkers"){
    await createNewCheckersRoom(roomCode);
    res.sendStatus(OK_STATUS).end();
  }else{
    res.sendStatus(404).end();
  }
});

app.get("/room/:code", async (req, res) => {
  const roomCode = req.params.code;
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);

  if(!roomJson){
    res.sendStatus(NOT_FOUND_STATUS).end();
  
  }else{
    res.json({roomType: roomJson.roomType});
  
  }

});

app.get("/add-player/:code/:roomtype/:nick", async (req, res) => {
  const roomCode = req.params.code;
  const roomType = req.params.roomtype;
  const nickName = req.params.nick;

  let json_;
  if(roomType === "Tic-Tac-Toe"){
    json_ = await tictactoeConnectionValidator(roomCode, nickName);
  }
  else if(roomType === "Checkers"){
    json_ = await checkersConnectionValidator(roomCode, nickName);
  }
  
  if(json_.erro){
    res.status(json_.status).json(json_);
    return null;
  }

  let roomJson;
  if(json_.message !== "AFK user waiting for reconnection!"){
    roomJson = await addNewPlayer(roomCode, nickName);
  }
  else{
    roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  }

  res.json(roomJson);

});

/* app.get("/checkers/:code", async (req, res) => {
  //const mockRows=[[{id:"0",imageSimbleCode:"whitePiece"},{id:"1",imageSimbleCode:"brow"},{id:"2",imageSimbleCode:"whitePiece"},{id:"3",imageSimbleCode:"brow"},{id:"4",imageSimbleCode:"whitePiece"},{id:"5",imageSimbleCode:"brow"},{id:"6",imageSimbleCode:"whitePiece"},{id:"7",imageSimbleCode:"brow"}],[{id:"8",imageSimbleCode:"brow"},{id:"9",imageSimbleCode:"whitePiece"},{id:"10",imageSimbleCode:"brow"},{id:"11",imageSimbleCode:"whitePiece"},{id:"12",imageSimbleCode:"brow"},{id:"13",imageSimbleCode:"whitePiece"},{id:"14",imageSimbleCode:"brow"},{id:"15",imageSimbleCode:"whitePiece"}],[{id:"16",imageSimbleCode:"whitePiece"},{id:"17",imageSimbleCode:"brow"},{id:"18",imageSimbleCode:"whitePiece"},{id:"19",imageSimbleCode:"brow"},{id:"20",imageSimbleCode:"whitePiece"},{id:"21",imageSimbleCode:"brow"},{id:"22",imageSimbleCode:"whitePiece"},{id:"23",imageSimbleCode:"brow"}],[{id:"24",imageSimbleCode:"brow"},{id:"25",imageSimbleCode:"wood"},{id:"26",imageSimbleCode:"brow"},{id:"27",imageSimbleCode:"wood"},{id:"28",imageSimbleCode:"brow"},{id:"29",imageSimbleCode:"wood"},{id:"30",imageSimbleCode:"brow"},{id:"31",imageSimbleCode:"wood"}],[{id:"32",imageSimbleCode:"wood"},{id:"33",imageSimbleCode:"brow"},{id:"34",imageSimbleCode:"wood"},{id:"35",imageSimbleCode:"brow"},{id:"36",imageSimbleCode:"wood"},{id:"37",imageSimbleCode:"brow"},{id:"38",imageSimbleCode:"wood"},{id:"39",imageSimbleCode:"brow"}],[{id:"40",imageSimbleCode:"brow"},{id:"41",imageSimbleCode:"redPiece"},{id:"42",imageSimbleCode:"brow"},{id:"43",imageSimbleCode:"redPiece"},{id:"44",imageSimbleCode:"brow"},{id:"45",imageSimbleCode:"redPiece"},{id:"46",imageSimbleCode:"brow"},{id:"47",imageSimbleCode:"redPiece"}],[{id:"48",imageSimbleCode:"redPiece"},{id:"49",imageSimbleCode:"brow"},{id:"50",imageSimbleCode:"redPiece"},{id:"51",imageSimbleCode:"brow"},{id:"52",imageSimbleCode:"redPiece"},{id:"53",imageSimbleCode:"brow"},{id:"54",imageSimbleCode:"redPiece"},{id:"55",imageSimbleCode:"brow"}],[{id:"56",imageSimbleCode:"brow"},{id:"57",imageSimbleCode:"redPiece"},{id:"58",imageSimbleCode:"brow"},{id:"59",imageSimbleCode:"redPiece"},{id:"60",imageSimbleCode:"brow"},{id:"61",imageSimbleCode:"redPiece"},{id:"62",imageSimbleCode:"brow"},{id:"63",imageSimbleCode:"redPiece"}]];
  const roomCode = req.params.code;
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  res.json({mockRows: roomJson.cellsRows});
}) */

app.get("*", (req, res) => {
  res.sendFile(buildPath + "/index.html");
});

io.on("connection", async (socket) => {
  const roomType = socket.handshake.query.rootype;

  if(roomType === 'Tic-Tac-Toe'){
    await ticTacToeSocketHandler(socket, io);
  }
  else if(roomType === 'Checkers'){
    await checkersSocketHandler(socket, io);

  }

});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
