import React from "react";
import {apiDomain} from "../../../domain";
import { Form, redirect, useActionData} from "react-router-dom";

export async function action(formData){
  //const formData = await request.formData();
  const roomCode = formData.get("roomCode");
  const test = formData.get("joinRoom");
  if(roomCode === ""){
    return {form: "JoinRoomForm", message:"Enter a room code!"};
  }
  const response = await fetch(`${apiDomain}/room/${roomCode}`);

  if(response.status !== 200){
    return {form:"JoinRoomForm", message: "Room code not found!"};
  }

  const url = `/nick/${roomCode}`;
  return redirect(url);

}

function JoinRoom() {
  const erro = useActionData();
  return (
    <React.StrictMode>
    <div className="container p-2 m-lg-2 mt-2 mb-2" style={{ backgroundColor: "#eeeeee" }}>
      <div
        className="container-fluid p-2"
        style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
      >
        <div className="contairer"> Join a room</div>
        <Form method="post" className="row">
        {erro && erro.form === "JoinRoomForm" && <div className="col-12 d-flex justify-content-center">
              {erro.message}
            </div>}
        <input type="hidden" name="Form" value="JoinRoomForm" />
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
