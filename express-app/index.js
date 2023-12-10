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
const {ticTacToeSocketHandler, createNewTictactoeRoom} = require("./tictactoesockethandler");

const CONFLICT_STATUS = 409;
const OK_STATUS = 200;

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});

app.post("/newRoom", async (req, res) => {
  console.log("new room route");
  const body = req.body;
  console.log(body);
  const roomCode = body.roomCode;
  const anwser = getJsonFromJsonStringFromRedis(roomCode);

  if(anwser){
    console.log("new room route failed");
    res.sendStatus(CONFLICT_STATUS).end();

  }else{
    createNewTictactoeRoom(roomCode);
    res.sendStatus(OK_STATUS).end();
  
  }
})

io.on("connection", async (socket) => {
  //const anwser = await client.get("test_key");
  //console.log(anwser);
  if(socket.handshake.query.rootype === 'tic-tac-toe'){
    await ticTacToeSocketHandler(socket, io);
  }
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
