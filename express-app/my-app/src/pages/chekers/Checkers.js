import React from "react";
import CheckersGridOfCells from "./components/Checkersgrid";
import Players from "./components/Players";
import ReadyButton from "./components/ReadyButton";
import ShareButton from "./components/ShareButton";
import WinnerMessage from "./components/WinnerMessage";
import { apiDomain, appDomain } from "../../domain";
import { useLoaderData } from "react-router-dom";
import { io } from "socket.io-client";

export async function loader({ params }) {
  const roomCode = params.code;
  const userName = params.username;
  const url = `${apiDomain}/add-player/${roomCode}/Checkers/${userName}`;
  //const response = await fetch(`${apiDomain}/checkers/${roomCode}`);
  const response = await fetch(url);
  const resJson = await response.json();
  //console.log(resJson);

  const socketUrl = `${apiDomain}`;
  const socket = io(socketUrl, { autoConnect: false, reconnection: false, query: { room: params.code, userName: params.username , rootype: 'Checkers' } });
  return {...resJson, roomCode: roomCode, socket: socket};
}


function Checkers() {
  const resJson = useLoaderData();
  const roomCode = resJson.roomCode;
  const socket = resJson.socket;
  const [cellsRows, setCellsRows] = React.useState(resJson.cellsRows);
  const [players, setPlayers] = React.useState(resJson.players);
  const [playerOfTheTurn, setPlayerOfTheTurn] = React.useState(resJson.playerOfTheTurn);
  const [gameState, setGameState] = React.useState(resJson.state);
  const [winner, setWinner] = React.useState(false);

  React.useEffect(() => {

    function cellClickHandler(cellsRows, playerOfTheTurn) {
      console.log(cellsRows);
      setCellsRows(cellsRows);
      setPlayerOfTheTurn(playerOfTheTurn);
    }
    socket.on("player-click", cellClickHandler);

    function playerJoinsHandler(players, playerOfTheTurn) {
      setPlayers(players);
      setPlayerOfTheTurn(playerOfTheTurn);
    }
    socket.on("player-joins", playerJoinsHandler);

    function startGameHandler(cellsRows, playerOfTheTurn, state){
      setCellsRows(cellsRows);
      setPlayerOfTheTurn(playerOfTheTurn);
      setGameState(state);
    }
    socket.on("start-game", startGameHandler);

    function ready(players){
      setPlayers(players);  
    }
    socket.on("ready", ready);

    function diconnectHandler(){
      throw {erroMessage: "You was disconnected. somethin went wrong!"}
    }
    socket.on("disconnect", diconnectHandler);

    function winnerPlayer(cellsRows, winnerPlayer, gameState, players){
      setCellsRows(cellsRows);
      setWinner(winnerPlayer);
      setGameState(gameState);
      setPlayers(players);
    }
    socket.on("winner-player", winnerPlayer);

    socket.connect();

    return () => {
      socket.off("player-click", cellClickHandler);
      socket.off("player-joins", playerJoinsHandler);
      socket.off("start-game", startGameHandler);
      socket.off("ready", ready);
      socket.off("disconnect", diconnectHandler);
      socket.off("winner-player", winnerPlayer);
      socket.disconnect();
    };
  }, [0]);

  function readyButtonHandleClick(){
    socket.emit("ready");
  }

  function shareButtonHandleClick(){
    const url = `${appDomain}/nick/${roomCode}/Checkers`;
    navigator.clipboard.writeText(url);
  }

  const buttonsDiv = (
    <div className="row justify-content-center">
      <div className="col-6 ">
        <ReadyButton disabled={false} onClickHandler={readyButtonHandleClick} />
      </div>
      <div className="col-6 ">
        <ShareButton disabled={false} onClickHandler={shareButtonHandleClick} />
      </div>
    </div>
  );

  function cellHandleClick(id){
    socket.emit("player-click", id);
  }
  
  function conditionalRenderingByGameState() {
    switch (gameState) {
      case "pre-start":
        return buttonsDiv;
  
      case "started":
        return (
          <CheckersGridOfCells
            cellsRows={cellsRows}
            handleClick={cellHandleClick}
          />
        );
  
      case "finished":
        return (
          <>
            {winner && (
              <WinnerMessage
                message={winner === "draw" ? "Draw" : `${winner} won!`}
              />
            )}
            {buttonsDiv}
            <CheckersGridOfCells
              cellsRows={cellsRows}
              handleClick={cellHandleClick}
            />
          </>
        );
    }
  }

  return (
    <>
        <Players players={players} playerOfTheTurn={playerOfTheTurn} />
        {conditionalRenderingByGameState()}
    </>
  );
}

export default Checkers;
