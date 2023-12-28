const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
app.use(cors());
const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));

const {client, jsonStringIntoRedis, getJsonFromJsonStringFromRedis} = require("./redis");


const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Socket } = require("node:dgram");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:2000"],
  },
});
const {ticTacToeSocketHandler, createNewTictactoeRoom, tictactoeConnectionValidator, addNewPlayer} = require("./tictactoesockethandler");

const CONFLICT_STATUS = 409;
const OK_STATUS = 200;
const NOT_FOUND_STATUS = 404;

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});

app.post("/newRoom", async (req, res) => {
  const body = req.body;
  const roomCode = body.roomCode;
  const roomType = body.roomType;
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);

  if(roomJson){
    console.log("new room route failed");
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
    res.json(roomJson);
  
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

io.on("connection", async (socket) => {
  //const roomJson = await client.get("test_key");
  //console.log(roomJson);
  if(socket.handshake.query.rootype === 'tic-tac-toe'){
    await ticTacToeSocketHandler(socket, io);
  }
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
