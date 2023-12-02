import React from "react";
import xImage from "../x.png";
import circleImage from "../circle.png";
import blankImage from "../blank.png";

function Cell({ id, imageCode, handleClick }) {
    let style = {
      width: "100%",
      height: "100%",
    };
    let imageUrl;
    switch (imageCode) {
      case "blank":
        imageUrl = blankImage;
        break;
  
      case "x":
        imageUrl = xImage;
        break;
  
      case "circle":
        imageUrl = circleImage;
        break;
    }
  
    return (
      <div className="container p-0" style={style} id={id} onClick={handleClick}>
        <img className="img-fluid" src={imageUrl} />
      </div>
    );
  }

function TicTactoeGridOfCells({ cellsRows, handleClick }) {
const colStyle = {
    maxHeight: "90px",
    maxWidth: "90px",
};

const cellsComponentsRows = cellsRows.map((row, indexRow) => {
    return row.map((cell, indexCell) => {
    return (
        <div
        key={`${indexRow}:${indexCell}`}
        className="col-4 m-1 p-0"
        style={colStyle}
        >
        <Cell
            key={cell.id}
            id={cell.id}
            imageCode={cell.imageSimbleCode}
            handleClick={() => handleClick(cell.id)}
        />
        </div>
    );
    });
});
const gridStyle = {
    minHeight: "270px",
    minWidth: "270px",
    backgroundColor: "#aaaaaa",
};

return (
    <div className="d-flex justify-content-center" style={gridStyle}>
    <div className="" style={{ backgroundColor: "#ff8888" }}>
        <div className="row col-12 p-0 m-1">{cellsComponentsRows[0]}</div>
        <div className="row col-12 p-0 m-1">{cellsComponentsRows[1]}</div>
        <div className="row col-12 p-0 m-1">{cellsComponentsRows[2]}</div>
    </div>
    </div>
);
}


export default TicTactoeGridOfCells