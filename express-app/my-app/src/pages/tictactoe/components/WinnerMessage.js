import React from "react";

export default function WinnerMessage({message}) {
  return (
    <div className="container-fluid d-flex justify-content-center">
      <div
        className="col-12  container p-2 m-lg-2 mt-2 mb-2"
        style={{ backgroundColor: "#eeeeee" }}
      >
        <div
          className="container-fluid p-2 d-flex justify-content-center"
          style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
        >
            <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
