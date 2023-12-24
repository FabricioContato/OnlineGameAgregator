import React from "react";
import { useParams, useLoaderData } from "react-router-dom";
import Players from "./components/Players";
import TicTactoeGridOfCells from "./components/Tictacttoegrid";
import ReadyButton from "./components/ReadyButton";
import WinnerMessage from "./components/WinnerMessage";
import { io } from "socket.io-client";
const URL = "http://localhost:5000";

export async function loader({ params }){
  const url = `http://127.0.0.1:5000/room/${params.code}`;
  
  const response = await fetch(url);

  if(response.status !== 200){
    throw {erroMessage: `Room "${params.code}" not found`}
  }

  const socket = io(URL, { autoConnect: false, reconnection: false, query: { room: params.code, userName: params.username , rootype: 'tic-tac-toe' } });
  const resJson = await response.json()
    

  return {...resJson, socket: socket, userName: params.username};
}

/* export function loader(){

} */

function TicTacToe() {
  const data = useLoaderData();
  const socket = data.socket;
  const userName = data.userName;
  const [gameState, setGameState] = React.useState(data.state);
  const [playerOfTheTurn, setPlayerOfTheTurn] = React.useState(data.playerOfTheTurn);
  const [cellsRows, setCellsRows] = React.useState(data.cellsRows);
  const [players, setPlayers] = React.useState(data.players);
  const [winner, setWinner] = React.useState(false);

 /*  function playersJoinsOrLeave(userNameArry, playerOfTheTurn){
    const newPlayers = JSON.parse(JSON.stringify(inactivePlayers));
    for(let i=0; i < userNameArry.length; i++){
      newPlayers[i].userName = userNameArry[i];
      newPlayers[i].active = newPlayers[i].userName === playerOfTheTurn;
    }

    return newPlayers;
  } */

  /* function setPlayers_(playerOfTheTurn){
    setPlayers((prePlayers) => {
      const newPlayers = JSON.parse(JSON.stringify(prePlayers));
        for (let i = 0; i < newPlayers.length; i++) {
          newPlayers[i].active = newPlayers[i].userName === playerOfTheTurn;
        }
        return newPlayers;})
  } */

  React.useEffect(() => {

    function cellClickHandler(cellsRows, playerOfTheTurn) {
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

  function cellHandleClick(id) {
    socket.emit("player-click", id);
  }

  function readyButtonHandleClick(){
    socket.emit("ready");
  }

  const readyButtonDiv =  <div className="d-flex justify-content-center"> 
                            <ReadyButton disabled={false} onClickHandler={readyButtonHandleClick} />
                          </div>;

  function conditionalRenderingByGameState(){
    switch(gameState){
      case "pre-start":
        return readyButtonDiv;
      
      case "started":
        return <TicTactoeGridOfCells cellsRows={cellsRows} handleClick={cellHandleClick} />;

      case "finished":
        return (<>
                  <WinnerMessage message= {winner === userName ? "You Won": "You Lost" } />
                  {readyButtonDiv}
                  <TicTactoeGridOfCells cellsRows={cellsRows} handleClick={cellHandleClick} />
                </>)

    }
  }

  return (
    <>
      <React.StrictMode>
        <Players players={players} playerOfTheTurn={playerOfTheTurn} />
      </React.StrictMode>
      <React.StrictMode>
        {conditionalRenderingByGameState()}
      </React.StrictMode>
    </>
  );
}

export default TicTacToe;
