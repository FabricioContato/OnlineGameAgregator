import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import xImage from "./x.png";
import circleImage from "./circle.png";
import blankImage from "./blank.png";
import noUserImage from "./no_image_user.png";

import { io } from 'socket.io-client';
const URL = "http://localhost:5000";

function TicTacToe(){
  return (<><Players />
          <TicTactoeGridOfCells /></>);
}

function Cell({ id, imageCode, handleClick }) {
  let style = {
    width: "100%",
    height: "100%",
  }
  let imageUrl;
  switch (imageCode){
    case 'blank':
      imageUrl = blankImage;
      break;
    
    case 'x':
      imageUrl = xImage;
      break;

    case 'circle':
      imageUrl = circleImage;
      break;
  }

  return (
    <div
      className="container p-0"
      style={style}
      id={id}
      onClick={handleClick}
    >
      <img className="img-fluid" src={imageUrl}/>
    </div>
  );
}

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

function TicTactoeGridOfCells() {
  const [myTurn, setMyTurn] = React.useState(false);
  const [cellsRows, setCellsRows] = React.useState(startCellsRowsList);
  const socket = React.useMemo(() => io(URL, {autoConnect: false, query: {room: "room_test"}}), [0]);
 
  React.useEffect(() => {
    socket.connect();

    function cellClickHandler(cellsRows, playerOfTheTurnId){
      setCellsRows(cellsRows);
      setMyTurn(playerOfTheTurnId === socket.id);
    }
    socket.on("player-click", cellClickHandler);

    function amIFirstToPlay(anwser){
      setMyTurn(anwser);
    }
    socket.on("am-I-first-to-play", amIFirstToPlay);

    socket.emit("am-I-first-to-play");

    return () =>{
      socket.off("player-click", cellClickHandler);
      socket.off("first-to-play", amIFirstToPlay);
      socket.disconnect();
    }
     
  }, [0]);

  function handleClick(id){
    socket.emit("player-click", id);
      
  }

  /* function handleClick(id, image) {
    // send a message to the server
    // server sends a message back updating a 
    console.log(id);
    const newImage = image === blankImage ? xImage : blankImage;
    setCellsRows((preCellsRows) => {
      return preCellsRows.map((row) => {
        return row.map((cell) => {
          const image_ = id === cell.id ? newImage : cell.image;
          return { ...cell, image: image_ };
        });
      });
    });
  } */

  const colStyle = {
    maxHeight: "90px",
    maxWidth: "90px",
  };

  const cellsComponentsRows = cellsRows.map((row) => {
    return row.map((cell) => {
      return (
        <React.StrictMode>
        <div className="col-4 m-1 p-0" style={colStyle}>
        <Cell
          key={cell.id}
          id={cell.id}
          imageCode={cell.imageSimbleCode}
          handleClick={() => handleClick(cell.id)}
        />
        </div>
        </React.StrictMode>
      );
    });
  });
  const gridStyle = {
    minHeight: "270px",
    minWidth: "270px",
    backgroundColor: "#aaaaaa"
  };


  return (
    <div className="d-flex justify-content-center" style={gridStyle}>
      <div className="" style={{backgroundColor: "#ff8888"}}>
      <div className="row col-12 p-0 m-1">
        {cellsComponentsRows[0]}
      </div>
      <div className="row col-12 p-0 m-1">
        {cellsComponentsRows[1]}
      </div>
      <div className="row col-12 p-0 m-1">
        {cellsComponentsRows[2]}
      </div>
      </div>
    </div>
  );
}

function Player({userName, active, addClass}){
  const style = active ?  {backgroundColor: "#FDC676", border: "5px solid"} : {backgroundColor: "#FDC676", border: "5px solid #008800"};
  return(
    <div className={"container-fluid " + addClass} style={style}>
    <div className="row ">
      <img className="image-fluid w-25 col-4" src={noUserImage} alt="no user" />
      <div className="col-8">
        {/* <p>Player 1:</p> */}
        <p>{userName}</p>
      </div>
    </div>
    </div>
  );
}

const mockPlayers = [{userName: "user1", active: true, addClass: "col-6"},{userName: "user2", active: false, addClass: "col-6"}];

function Players(){
  const [players, setPlayers] = React.useState(mockPlayers);

  const elements = players.map((player)=>{
    return <Player userName={player.userName} active={player.active} addClass={player.addClass} />
  });

  return(<React.StrictMode>
        <div className="row">
           {elements}
         </div>
         </React.StrictMode>);

}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <TicTacToe/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
