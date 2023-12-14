import React from "react";
import { useParams, useLoaderData } from "react-router-dom";
import Players from "./components/Players";
import TicTactoeGridOfCells from "./components/Tictacttoegrid";
import { io } from "socket.io-client";
const URL = "http://localhost:5000";

export async function loader({ params }){
  const url = `http://127.0.0.1:5000/room/${params.code}`;
  //const urlObj = new URLSearchParams();
  //urlObj.append("roomCode", params.code);
  //const postJson = { method: "GET",  body: urlObj};
  const response = await fetch(url);

  if(response.status !== 200){
    throw {erroMessage: "Room not found"}
  }

  const socket = io(URL, { autoConnect: false, query: { room: params.code, userName: params.username , rootype: 'tic-tac-toe' } });
  const resJson = await response.json()
  console.log(resJson);
  return {...resJson, socket: socket};
}

const inactivePlayers = [
  { userName: "...", active: false, addClass: "col-6" },
  { userName: "...", active: false, addClass: "col-6" },
];

/* export function loader(){

} */

function TicTacToe() {
  const data = useLoaderData();
  const socket = data.socket;
  const [cellsRows, setCellsRows] = React.useState(data.cellsRows);
  const [players, setPlayers] = React.useState(playersJoinsOrLeave(data.players, data.playerOfTheTurn));

  function playersJoinsOrLeave(userNameArry, playerOfTheTurn){
    const newPlayers = JSON.parse(JSON.stringify(inactivePlayers));
    for(let i=0; i < userNameArry.length; i++){
      newPlayers[i].userName = userNameArry[i];
      newPlayers[i].active = newPlayers[i].userName === playerOfTheTurn;
    }

    return newPlayers;
  }

  function setPlayers_(playerOfTheTurn){
    setPlayers((prePlayers) => {
      const newPlayers = JSON.parse(JSON.stringify(prePlayers));
        for (let i = 0; i < newPlayers.length; i++) {
          newPlayers[i].active = newPlayers[i].userName === playerOfTheTurn;
        }
        return newPlayers;})
  }

  React.useEffect(() => {

    function cellClickHandler(cellsRows, playerOfTheTurn) {
      setCellsRows(cellsRows);
      setPlayers_(playerOfTheTurn);
    }
    socket.on("player-click", cellClickHandler);

    function playerJoinsHandler(userNames, playerOfTheTurn) {
      setPlayers(playersJoinsOrLeave(userNames, playerOfTheTurn));
      /* if (userNames.length < 2) {
        userNames.push("...");
      }

      const newPlayers = JSON.parse(JSON.stringify(players));
      newPlayers[0].userName = userNames[0];
      newPlayers[1].userName = userNames[1];

      newPlayers[0].active = newPlayers[0].userName === playerOfTheTurnId;
      newPlayers[1].active = newPlayers[1].userName === playerOfTheTurnId;

      setPlayers(newPlayers) */;
    }
    socket.on("player-joins", playerJoinsHandler);

    socket.connect();

    return () => {
      socket.off("player-click", cellClickHandler);
      socket.off("player-joins", playerJoinsHandler);
      socket.disconnect();
    };
  }, [0]);

  function handleClick(id) {
    socket.emit("player-click", id);
  }

  return (
    <>
      <React.StrictMode>
        <Players players={players} />
      </React.StrictMode>
      <React.StrictMode>
        <TicTactoeGridOfCells cellsRows={cellsRows} handleClick={handleClick} />
      </React.StrictMode>
    </>
  );
}

export default TicTacToe;
