import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import NewRoomForm from "./components/NewRoomForm";
import JoinRoom from "./components/JoinRoom";
import News from "./components/News";
import Nav from "./components/Nav";
import heroImage from "./components/jklm_hero_image_react_bootstrap.png";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Nav />
    <img
      className="img-fluid"
      src={heroImage}
    ></img>
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-6 col-md-12">
          <NewRoomForm />
        </div>
        <div className="col-lg-6">
          <JoinRoom />
          <News />
        </div>
      </div>
    </div>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
