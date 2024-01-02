import React from "react";

export default function ShareButton({ disabled, onClickHandler }){

    return(
        <button style={{marginRight: "auto", display: "block"}} className="btn btn-primary" disabled={disabled} onClick={onClickHandler}>
            Copy Link
        </button>
    );
}