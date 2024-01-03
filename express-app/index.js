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
    res.sendStatus(OK_STATUS).end();
  
  }

});

app.get("/add-player/:code/:nick", async (req, res) => {
  const roomCode = req.params.code;
  const nickName = req.params.nick;
  const json_ = await tictactoeConnectionValidator(roomCode, nickName);
  
  if(json_.erro){
    res.status(json_.status).json(json_);
    return null;
  }

  let roomJson
  if(json_.message !== "AFK user waiting for reconnection!"){
    roomJson = await addNewPlayer(roomCode, nickName);
  }
  else{
    roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  }

  res.json(roomJson);

});

app.get("*", (req, res) => {
  res.sendFile(buildPath + "/index.html");
});

io.on("connection", async (socket) => {
  if(socket.handshake.query.rootype === 'tic-tac-toe'){
    await ticTacToeSocketHandler(socket, io);
  }
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
