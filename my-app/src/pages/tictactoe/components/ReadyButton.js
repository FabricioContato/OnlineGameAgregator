import React from "react";

export default function ReadyButton({ disabled, onClickHandler }){

    return(
        <button className="btn btn-primary" disabled={disabled} onClick={onClickHandler}>
            Ready
        </button>
    );
}