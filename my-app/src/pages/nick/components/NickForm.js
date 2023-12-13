import React from "react";
import { Form } from "react-router-dom";

export default function Nickform() {
  return (
    <div className="row align-items-center">
    <div
      className="col-12  container p-2 m-lg-2 mt-2 mb-2"
      style={{ backgroundColor: "#eeeeee" }}
    >
      <div
        className="container-fluid p-2"
        style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
      >
        <Form className="row">
          <div className="col-9">
            <input
              className="form-control"
              type="text"
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
