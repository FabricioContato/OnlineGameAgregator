const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors");
app.use(cors());

//const client = require("./redis");

const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Socket } = require("node:dgram");
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:2000"],
  },
});
const {ticTacToeSocketHandler} = require("./tictactoesockethandler");

app.get("/", (req, res) => {
  console.log("get/ ok");
  res.json({ answer: "express ok" });
});



io.on("connection", async (socket) => {
  //const anwser = await client.get("test_key");
  //console.log(anwser);
  if(socket.handshake.query.rootype === 'tic-tac-toe'){
    await ticTacToeSocketHandler(socket, io);
  }
});

server.listen(PORT, () => console.log(`Express app listening at port ${PORT}`));
