import React from "react";
import { useRouteError } from "react-router-dom";

export default function ErroMessage(){
    const erro = useRouteError();
    
    return(
        <h1>{erro ? erro.erroMessage : "Page not found! Please verify your browser URL."}</h1>
    );
}