import React from "react";
import { Form, redirect, useParams} from "react-router-dom";

export async function action({request, params}){
  const formData = await request.formData();
  const nickName = formData.get("nickname");
  if(nickName === ""){
    return null;
  }
  const code = params.code;
  return redirect(`/tictactoe/${code}/${nickName}`);
}

export default function Nickform() {
  //const erroMessage = useActionData();
  const {erro} = useParams();

  return (
    <div className="row align-items-center">
    <div
      className="col-12  container p-2 m-lg-2 mt-2 mb-2"
      style={{ backgroundColor: "#eeeeee" }}
    >
      {erro && <span>"Nick in use!"</span> }
      <div
        className="container-fluid p-2"
        style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
      >
        <Form method="post" className="row">
          <div className="col-9">
            <input
              className="form-control"
              type="text"
              name="nickname"
              placeholder="Nick-name"
            />
          </div>
          <div className="col-3">
            <input className="btn btn-primary" type="submit" value="OK" />
          </div>
        </Form>
      </div>
    </div>
    </div>
  );
}
