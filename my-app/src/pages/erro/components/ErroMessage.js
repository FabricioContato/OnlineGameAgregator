import React from "react";
import { useRouteError } from "react-router-dom";

export default function ErroMessage(){
    const erro = useRouteError();
    
    return(
        <h1>{erro.erroMessage}</h1>
    );
}