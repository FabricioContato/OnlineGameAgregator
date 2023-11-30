import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import xImage from "./x.png";
import circleImage from "./circle.png";
import blankImage from "./blank.png";

import { io } from 'socket.io-client';
const URL = "http://localhost:5000";

const cellsRows_ = [
  [
    { id: 0, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "none"           , borderTop: "none"           , borderBottom: "2px solid black"} },
    { id: 1, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "none"           , borderTop: "2px solid black", borderBottom: "2px solid black"} },
    { id: 2, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "none"           , borderTop: "2px solid black", borderBottom: "none"           }  },
  ],
  [
    { id: 3, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "2px solid black", borderTop: "none"           , borderBottom: "2px solid black"}  },
    { id: 4, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "2px solid black", borderTop: "2px solid black", borderBottom: "2px solid black"}  },
    { id: 5, color: "#ff0000", image: blankImage, addStyle: {borderRight: "2px solid black", borderLeft: "2px solid black", borderTop: "2px solid black", borderBottom: "none"           }  },
  ],
  [
    { id: 6, color: "#ff0000", image: blankImage, addStyle: {borderRight: "none"           , borderLeft: "2px solid black", borderTop: "none"           , borderBottom: "2px solid black"}  },
    { id: 7, color: "#ff0000", image: blankImage, addStyle: {borderRight: "none"           , borderLeft: "2px solid black", borderTop: "2px solid black", borderBottom: "2px solid black", padding: "2px"}  },
    { id: 8, color: "#ff0000", image: blankImage, addStyle: {borderRight: "none"           , borderLeft: "2px solid black", borderTop: "2px solid black", borderBottom: "none"           }  },
  ],
];

function Cell({ id, image, addStyle, handleClick }) {
  let style = {
    width: "100%",
    height: "100%",
  }
  //style = {...style, ...addStyle};
  return (
    <div
      className="container p-0"
      style={style}
      id={id}
      onClick={handleClick}
    >
      <img className="img-fluid" src={image}/>
    </div>
  );
}

function TicTactoeGridOfCells() {
  const [myTurn, setMyTurn] = React.useState(false);
  const [cellsRows, setCellsRows] = React.useState(cellsRows_);
  const socket = React.useMemo(() => io(URL, {autoConnect: false, room: "room_test"}), [0]);
 
  React.useEffect(() => {
    socket.connect();

    function updateCellsRows(cellId, simble){
      const rowIndex = Math.floor(cellId / 3);
      const cellIndex = cellId - rowIndex * 3;
      const newImage = simble === "x" ? xImage : circleImage;

      setCellsRows( prevCellsRows => {
        const preCellsRowsDeepClone = JSON.parse(JSON.stringify(prevCellsRows));
        preCellsRowsDeepClone[rowIndex][cellIndex].image = newImage;
        return preCellsRowsDeepClone;
      } );
    }
    function isMyTurn(playerOfTheTurnId){
      setMyTurn(playerOfTheTurnId === socket.id);
    }
    function cellClickHandler(cellId, simble, playerOfTheTurnId){
      updateCellsRows(cellId, simble);
      isMyTurn(playerOfTheTurnId);
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
    if (myTurn){
      socket.emit("player-click", id);
    
    }else{
      console.log("it is not your turn!");
    }
      
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
        <div className="col-4 m-1 p-0" style={colStyle}>
        <Cell
          key={cell.id}
          id={cell.id}
          image={cell.image}
          addStyle={cell.addStyle}
          handleClick={() => handleClick(cell.id)}
        />
        </div>
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <TicTactoeGridOfCells />
    

    <div className="container">1234566</div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
