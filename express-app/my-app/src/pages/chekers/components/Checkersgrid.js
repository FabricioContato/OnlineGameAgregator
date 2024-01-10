import React from "react";
import brow from "./images/brow.png";
import wood from "./images/wood.png";
import whitePiece from "./images/white_piece.png";
import whitePieceHighlight from "./images/white_piece_highlight.png";
import redPieceHighlight from "./images/red_piece_highlight.png";
import redPiece from "./images/red_piece.png";
import yellowPiece from "./images/yellow.png";
import greenPice from "./images/green.png";

function Cell({ id, imageCode, handleClick }) {
    let style = {
      width: "100%",
      height: "100%",
    };
    let imageUrl;
    switch (imageCode) {
      case "wood":
        imageUrl = wood;
        break;
  
      case "brow":
        imageUrl = brow;
        break;

      case "redPiece":
        imageUrl = redPiece;
        break;

      case "whitePiece":
        imageUrl = whitePiece;
        break;
      
      case "yellow":
        imageUrl = yellowPiece;  
        break;

      case "green":
        imageUrl = greenPice;
        break;
      
      case "redPieceHighlight":
        imageUrl = redPieceHighlight;
        break;

      case "whitePieceHighlight":
        imageUrl = whitePieceHighlight;
        break;
    }
  
    return (
      <div className="container p-0" style={style} id={id} onClick={handleClick}>
        <img className="img-fluid" src={imageUrl} />
      </div>
    );
  }

function CheckersGridOfCells({ cellsRows, handleClick }) {
const colStyle = {
    maxHeight: "60px",
    maxWidth: "60px",
};

const rowsComponents = cellsRows.map((row, indexRow) => {
  
    return <div key={indexRow} className="row col-12 p-0 m-0"> {row.map((cell, indexCell) => {
    return (
        <div
        key={`${indexRow}:${indexCell}`}
        className="col-4 p-0"
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
    })}</div>

    
});
const gridStyle = {
    minHeight: "480px",
    minWidth: "480px",
    backgroundColor: "#aaaaaa",
};

return (
    <div className="d-flex justify-content-center" style={gridStyle}>
    <div className="" style={{ backgroundColor: "#ff8888" }}>
      {rowsComponents}
    </div>
    </div>
);
}


export default CheckersGridOfCells