import React from "react";

function News() {
  return (
    <div className="container">
      <ul>
        <li>Create your online room and share the room link with a friend.</li>

        <li>
          Click on the ready button once you are prepared. Once both players are
          ready, the match starts.
        </li>

        <li>
          When the players leave the room, leaving it empty, the room is erased.
        </li>

        <li>
          If a player leaves a room in the middle of a match, they can reconnect
          using the same link as before, but they must use the same nickname as
          before. Otherwise, the system will assume they are another player
          trying to join a full room.
        </li>

        <li>
          This website does not use cookies or any other kind of browser
          storage.
        </li>

        <li>
          This website is heavily inspired by jklm.fun . Visit the original
          website.
        </li>
      </ul>
      {/*  <div className="row">
          <a href="#" className="col-3">
            link1
          </a>
          <a href="#" className="col-3">
            link2
          </a>
          <a href="#" className="col-3">
            link3
          </a>
          <a href="#" className="col-3">
            link4
          </a>
        </div> */}
    </div>
  );
}

export default News;
