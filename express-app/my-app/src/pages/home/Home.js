import React from "react";

import NewRoomForm, {action as NewRoomFormAction} from "./components/NewRoomForm";
import JoinRoom, {action as JoinRoomAction} from "./components/JoinRoom";
import News from "./components/News";
import heroImage from "./components/images/jklm_hero_image_react_bootstrap.png";

export async function action({request}){
  const formData = await request.formData();
  const form = formData.get("Form");

  return form === "NewRoomForm" ? NewRoomFormAction(formData) : JoinRoomAction(formData);
}

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