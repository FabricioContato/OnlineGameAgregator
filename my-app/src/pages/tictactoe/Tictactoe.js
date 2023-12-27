import React from "react";
import { useParams, useLoaderData, redirect } from "react-router-dom";
import Players from "./components/Players";
import TicTactoeGridOfCells from "./components/Tictacttoegrid";
import ReadyButton from "./components/ReadyButton";
import ShareButton from "./components/ShareButton";
import WinnerMessage from "./components/WinnerMessage";
import { io } from "socket.io-client";
const URL = "http://localhost:5000";

export async function loader({ params }){
  const roomCode = params.code;
  const userName = params.username;
  const url = `http://127.0.0.1:5000/add-player/${roomCode}/${userName}`;
  
  const response = await fetch(url);
  const resJson = await response.json();

  if(resJson.message === "Nickname is already in use!"){
    console.log("Nickname is already in use! erro");
    return redirect(`/nick/${roomCode}/409`);
  }

  if(resJson.message === "The Room is full" || response.status === 404){
    console.log(resJson.message);
    throw {erroMessage: resJson.message};
  }

  console.log("load function was successful!");
  const socket = io(URL, { autoConnect: false, reconnection: false, query: { room: params.code, userName: params.username , rootype: 'tic-tac-toe' } });
  return {...resJson, socket: socket,roomCode: roomCode, userName: userName};
  
}

/* export function loader(){

} */

function TicTacToe() {
  const data = useLoaderData();
  const socket = data.socket;
  const roomCode = data.roomCode;
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

  function shareButtonHandleClick(){
    const url = `localhost:3000/nick/${roomCode}`;
    navigator.clipboard.writeText(url);
  }

  const buttonsDiv =  (
                            <div className="row justify-content-center">
                              <div className="col-6 ">
                                <ReadyButton disabled={false} onClickHandler={readyButtonHandleClick} />
                              </div>
                              <div className="col-6 ">
                                <ShareButton disabled={false} onClickHandler={shareButtonHandleClick} />
                              </div>
                            </div>
                          );

  function conditionalRenderingByGameState(){
    switch(gameState){
      case "pre-start":
        return buttonsDiv;
      
      case "started":
        return <TicTactoeGridOfCells cellsRows={cellsRows} handleClick={cellHandleClick} />;

      case "finished":
        return (<>
                  <WinnerMessage message= {winner === userName ? "You Won": "You Lost" } />
                  {buttonsDiv}
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
