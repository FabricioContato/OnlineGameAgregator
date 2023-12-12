import React from "react";

import NewRoomForm from "./components/NewRoomForm";
import JoinRoom from "./components/JoinRoom";
import News from "./components/News";
import heroImage from "./components/images/jklm_hero_image_react_bootstrap.png";

function Home(){
    return (
        <>
          <img className="img-fluid" src={heroImage}></img>
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
}

export default Home;