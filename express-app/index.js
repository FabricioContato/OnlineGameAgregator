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
const NOT_FOUND_STATUS = 404;

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});

app.post("/newRoom", async (req, res) => {
  console.log("new room route");
  const body = req.body;
  console.log(`new room route; req.body: ${JSON.stringify(body)}`);
  const roomCode = body.roomCode;
  const anwser = await getJsonFromJsonStringFromRedis(roomCode);
  console.log(`mew room route; anwser to key ${roomCode}:  ${anwser}`);

  if(anwser){
    console.log("new room route failed");
    res.sendStatus(CONFLICT_STATUS).end();

  }else{
    await createNewTictactoeRoom(roomCode);
    res.sendStatus(OK_STATUS).end();
  
  }
});

app.get("/room/:code", async (req, res) => {
  const roomCode = req.params.code;
  const anwser = await getJsonFromJsonStringFromRedis(roomCode);

  if(!anwser){
    res.sendStatus(NOT_FOUND_STATUS).end();
  
  }else{
    res.json(anwser);
  
  }

});

io.on("connection", async (socket) => {
  //const anwser = await client.get("test_key");
  //console.log(anwser);
  if(socket.handshake.query.rootype === 'tic-tac-toe'){
    await ticTacToeSocketHandler(socket, io);
  }
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
