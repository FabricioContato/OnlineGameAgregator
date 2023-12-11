import React from "react";
import { useParams, useLoaderData } from "react-router-dom";
import Players from "./components/Players";
import TicTactoeGridOfCells from "./components/Tictacttoegrid";
import { io } from "socket.io-client";
const URL = "http://localhost:5000";


export async function loader({ params }){
  const socket = io(URL, { query: { room: params.code, rootype: 'tic-tac-toe' } })
  try {
    const response = await socket.timeout(50000).emitWithAck('room-state');
    console.log(response.cellsRows);
    console.log("loader function got response");
    return {...response, socket: socket};
  } catch (e) {
    console.log("the server did not acknowledge the event in the given delay");
  }
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
  const [players, setPlayers] = React.useState(newPlayers(data.playerOfTheTurnId));

  function newPlayers(playerOfTheTurnId){
    const newPlayers = JSON.parse(JSON.stringify(inactivePlayers));
        for (let i = 0; i < newPlayers.length; i++) {
          newPlayers[i].active = newPlayers[i].userName === playerOfTheTurnId;
        }
        return newPlayers;
  }

  React.useEffect(() => {
    socket.connect();

    function cellClickHandler(cellsRows, playerOfTheTurnId) {
      setCellsRows(cellsRows);
      setPlayers(newPlayers(playerOfTheTurnId));
    }
    socket.on("player-click", cellClickHandler);

    function playerJoinsHandler(userNames, playerOfTheTurnId) {
      if (userNames.length < 2) {
        userNames.push("...");
      }

      const newPlayers = JSON.parse(JSON.stringify(players));
      newPlayers[0].userName = userNames[0];
      newPlayers[1].userName = userNames[1];

      newPlayers[0].active = newPlayers[0].userName === playerOfTheTurnId;
      newPlayers[1].active = newPlayers[1].userName === playerOfTheTurnId;

      setPlayers(newPlayers);
    }
    socket.on("player-joins", playerJoinsHandler);

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
