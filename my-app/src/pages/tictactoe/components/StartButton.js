import React from "react";

export default function StartButton({ disabled, onClickHandler }){

    return(
        <button className="btn btn-primary" disabled={disabled} onClick={onClickHandler}>
            start
        </button>
    );
}