
import React from "react";

function JoinRoom() {
  const [formData, setFormData] = React.useState({
    roomCode: "",
  });
  
  React.useEffect(() => {
    //socket.connect();

    fetch("http://localhost:5000").then(anwser => anwser.json()).then(data => console.log(data));
  }, [0])


  function handleChange(event) {
    const name = event.target.name;
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: event.target.value
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log(formData);
  }

  return (
    <React.StrictMode>
    <div className="container p-2 m-lg-2 mt-2 mb-2" style={{ backgroundColor: "#eeeeee" }}>
      <div
        className="container-fluid p-2"
        style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
      >
        <div className="contairer"> Join a room</div>
        <form className="row" onSubmit={handleSubmit} >
          <div className="col-2 ">
            <div className="code">Code</div>
          </div>
          <div className="col-8">
            <input onChange={handleChange} name="roomCode" type="text" className="form-control" />
          </div>
          <div className="col-sm-2 col-12">
            <input className="btn btn-primary" type="submit" value="Join" />
          </div>
        </form>
      </div>
    </div>
    </React.StrictMode>
  );
}

export default JoinRoom;
