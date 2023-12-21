import React from "react";
import noUserImage from "./images/no_image_user.png";

function Player({ userName, active, ready, addClass }) {
  const style = active
    ? { backgroundColor: "#FDC676", border: "5px solid #008800" }
    : { backgroundColor: "#FDC676", border: "5px solid #000000" };
  return (
    <div className={"container-fluid " + addClass} style={style}>
      <div className="row ">
        <img
          className="image-fluid w-25 col-4"
          src={noUserImage}
          alt="no user"
        />
        <div className="col-4">
          {/* <p>Player 1:</p> */}
          <p>{userName}</p>
        </div>
        <div className="col-4">
          {ready ? <span>READY</span>: <span>UN-READY</span> }
        </div>
      </div>
    </div>
  );
}

function Players({ players, playersReady }) {
  const elements = players.map((player, index) => {
    return (
      <Player
        key={index}
        userName={player.userName}
        active={player.active}
        ready={playersReady.includes(player.userName)}
        addClass={player.addClass}
      />
    );
  });

  return <div className="row">{elements}</div>;
}

export default Players;
