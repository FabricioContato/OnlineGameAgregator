import React from "react";
import { Form, redirect, useParams} from "react-router-dom";

export async function action({request}){
  const formData = await request.formData();
  const roomCode = formData.get("roomCode");
  const test = formData.get("joinRoom");
  console.log(test);
  if(roomCode === ""){
    return null;
  }
  const url = `/nick/${roomCode}`;
  return redirect(url);

}

function JoinRoom() {

  return (
    <React.StrictMode>
    <div className="container p-2 m-lg-2 mt-2 mb-2" style={{ backgroundColor: "#eeeeee" }}>
      <div
        className="container-fluid p-2"
        style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
      >
        <div className="contairer"> Join a room</div>
        <Form method="post" className="row">
         <input type="hidden" name="joinRoom" value="joinRoom" />
          <div className="col-2 ">
            <div className="code">Code</div>
          </div>
          <div className="col-8">
            <input name="roomCode" type="text" className="form-control" />
          </div>
          <div className="col-sm-2 col-12">
            <input className="btn btn-primary" type="submit" value="Join" />
          </div>
        </Form>
      </div>
    </div>
    </React.StrictMode>
  );
}

export default JoinRoom;
