import React from "react";
import Players from "./players";
import TicTactoeGridOfCells from "./tictacttoegrid";
import { io } from "socket.io-client";
const URL = "http://localhost:5000";

const mockPlayers = [
  { userName: "...", active: false, addClass: "col-6" },
  { userName: "...", active: false, addClass: "col-6" },
];

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

function TicTacToe() {
  const [myTurn, setMyTurn] = React.useState(false);
  const [cellsRows, setCellsRows] = React.useState(startCellsRowsList);
  const socket = React.useMemo(
    () => io(URL, { autoConnect: false, query: { room: "room_test" } }),
    [0]
  );
  const [players, setPlayers] = React.useState(mockPlayers);

  React.useEffect(() => {
    socket.connect();

    function cellClickHandler(cellsRows, playerOfTheTurnId) {
      setCellsRows(cellsRows);
      setPlayers((prevPlayers) => {
        const newPlayers = JSON.parse(JSON.stringify(prevPlayers));
        for (let i = 0; i < newPlayers.length; i++) {
          newPlayers[i].active = newPlayers[i].userName === playerOfTheTurnId;
        }
        return newPlayers;
      });
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
