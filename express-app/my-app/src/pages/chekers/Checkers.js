import React from "react";
import CheckersGridOfCells from "./components/Checkersgrid";

export async function loader(){
    return "";
}

const mockRows=[[{id:"0",imageSimbleCode:"whitePiece"},{id:"1",imageSimbleCode:"brow"},{id:"2",imageSimbleCode:"whitePiece"},{id:"3",imageSimbleCode:"brow"},{id:"4",imageSimbleCode:"whitePiece"},{id:"5",imageSimbleCode:"brow"},{id:"6",imageSimbleCode:"whitePiece"},{id:"7",imageSimbleCode:"brow"}],[{id:"8",imageSimbleCode:"brow"},{id:"9",imageSimbleCode:"whitePiece"},{id:"10",imageSimbleCode:"brow"},{id:"11",imageSimbleCode:"whitePiece"},{id:"12",imageSimbleCode:"brow"},{id:"13",imageSimbleCode:"whitePiece"},{id:"14",imageSimbleCode:"brow"},{id:"15",imageSimbleCode:"whitePiece"}],[{id:"16",imageSimbleCode:"whitePiece"},{id:"17",imageSimbleCode:"brow"},{id:"18",imageSimbleCode:"whitePiece"},{id:"19",imageSimbleCode:"brow"},{id:"20",imageSimbleCode:"whitePiece"},{id:"21",imageSimbleCode:"brow"},{id:"22",imageSimbleCode:"whitePiece"},{id:"23",imageSimbleCode:"brow"}],[{id:"24",imageSimbleCode:"brow"},{id:"25",imageSimbleCode:"wood"},{id:"26",imageSimbleCode:"brow"},{id:"27",imageSimbleCode:"wood"},{id:"28",imageSimbleCode:"brow"},{id:"29",imageSimbleCode:"wood"},{id:"30",imageSimbleCode:"brow"},{id:"31",imageSimbleCode:"wood"}],[{id:"32",imageSimbleCode:"wood"},{id:"33",imageSimbleCode:"brow"},{id:"34",imageSimbleCode:"wood"},{id:"35",imageSimbleCode:"brow"},{id:"36",imageSimbleCode:"wood"},{id:"37",imageSimbleCode:"brow"},{id:"38",imageSimbleCode:"wood"},{id:"39",imageSimbleCode:"brow"}],[{id:"40",imageSimbleCode:"brow"},{id:"41",imageSimbleCode:"redPiece"},{id:"42",imageSimbleCode:"brow"},{id:"43",imageSimbleCode:"redPiece"},{id:"44",imageSimbleCode:"brow"},{id:"45",imageSimbleCode:"redPiece"},{id:"46",imageSimbleCode:"brow"},{id:"47",imageSimbleCode:"redPiece"}],[{id:"48",imageSimbleCode:"redPiece"},{id:"49",imageSimbleCode:"brow"},{id:"50",imageSimbleCode:"redPiece"},{id:"51",imageSimbleCode:"brow"},{id:"52",imageSimbleCode:"redPiece"},{id:"53",imageSimbleCode:"brow"},{id:"54",imageSimbleCode:"redPiece"},{id:"55",imageSimbleCode:"brow"}],[{id:"56",imageSimbleCode:"brow"},{id:"57",imageSimbleCode:"redPiece"},{id:"58",imageSimbleCode:"brow"},{id:"59",imageSimbleCode:"redPiece"},{id:"60",imageSimbleCode:"brow"},{id:"61",imageSimbleCode:"redPiece"},{id:"62",imageSimbleCode:"brow"},{id:"63",imageSimbleCode:"redPiece"}]];

function Checkers(){
    return (<CheckersGridOfCells cellsRows={mockRows} handleClick={() => console.log("mock click")} />);
}

export default Checkers;