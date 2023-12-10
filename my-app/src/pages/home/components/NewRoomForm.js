import React, { useEffect } from "react";
import { cardList } from "./cardList";
import { socket } from "./socketHandler";
import { Link, useNavigate } from "react-router-dom";

const radioButtonsList = [
  {
    type: "radio",
    id: "public",
    autoComplete: "off",
    checked: false,
    name: "roomPrivace",
    value: "Public",
  },
  {
    type: "radio",
    id: "private",
    autoComplete: "off",
    checked: false,
    name: "roomPrivace",
    value: "Private",
  },
];

function Card({ url, id, name, title, text, active, cardClick }) {
  const cardStyle = active
    ? { backgroundColor: "#888888", borderColor: "#888888", height: "280px" }
    : { backgroundColor: "#ffffff", borderColor: "#000000", height: "280px" };

  return (
    <div
      className="card"
      style={cardStyle}
      onClick={cardClick}
      id={id}
      name={name}
    >
      <img className="card-img-top" src={url} alt="" />
      <div className="card-body">
        <div
          className="card-title"
          style={{ height: "50px", textAlign: "center" }}
        >
          {title}
        </div>
        <div className="card-text d-none d-sm-block">{text}</div>
      </div>
    </div>
  );
}

function ButtonGroup({ radioButtons, handleChange }) {
  const radioButtonElements = radioButtons.map((radioButton, index) => {
    return (
      <label className="btn btn-secondary" key={index}>
        <input
          type={radioButton.type}
          name={radioButton.name}
          id={radioButton.id}
          autoComplete={radioButton.autoComplete}
          checked={radioButton.checked}
          onChange={handleChange}
          value={radioButton.value}
        />{" "}
        {radioButton.value}
      </label>
    );
  });

  return (
    <fieldset className="btn-group btn-group-toggle" data-toggle="buttons">
      {radioButtonElements}
    </fieldset>
  );
}

function CardOptions({ cards, cardClick }) {
  const bootstrapColNumber = Math.floor(12 / cards.length);

  const cardElements = cards.map((card, index) => {
    return (
      <div className={"col-sm-" + bootstrapColNumber + " col-6 "} key={index}>
        <Card
          url={card.url}
          id={card.id}
          title={card.title}
          text={card.text}
          name={card.name}
          active={card.active}
          cardClick={() => cardClick(card.name, card.title)}
        />
      </div>
    );
  });

  return <form className="row">{cardElements}</form>;
}

function NewRoomForm() {
  const [formData, setFormData] = React.useState({
    roomCode: "",
    roomPrivace: "Public",
    roomType: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();

    function messageHandler(msg) {
      console.log(msg);
    }

    socket.on("message", messageHandler);

    return () => {
      socket.off("message", messageHandler);
    };
  }, [0]);

  function setActiveCard(cardList) {
    return cardList.map((card) => {
      return card.id === formData.roomType ? { ...card, active: true } : card;
    });
  }

  const cards = setActiveCard(cardList);
  //console.log(cards);

  function setActiveRadioButtons(radioButtonsList) {
    //console.log("raduibyttib click");
    return radioButtonsList.map((radioButton) =>
      radioButton.value === formData.roomPrivace
        ? { ...radioButton, checked: true }
        : radioButton
    );
  }

  const radioButtons = setActiveRadioButtons(radioButtonsList);

  function handleChange(event) {
    const name = event.target.name;
    //console.log(`handleChange name: ${name}, value ${event.target.value}`);
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: event.target.value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const url = "http://127.0.0.1:5000/newRoom";
    const data = {roomCode: formData.roomCode};
    const postJson = { method: "POST", headers: {"Content-Type": "application/json",}, body: JSON.stringify(data)}
    const mesageStatus = await fetch(url, postJson).then(response => response.status);
    
    if(mesageStatus === 200){
      navigate(`/test/${formData.roomCode}`);
    }else{
      console.log(`message status: ${formData.roomCode} \n Room was not created.`)
    }

    /* socket.timeout(3000).emit("newRoom", formData, (err, response) => {
      if(err){
        console.log("server did not acknowledge the event in the given delay");
      }else{
        console.log(response.status);
      }
    }) */
  }

  function handleClick(name, value) {
    //console.log("ok");
    setFormData((prevFormData) => {
      return { ...prevFormData, [name]: value };
    });
  }

  return (
    <React.StrictMode>
      <div
        className="container p-2 m-lg-2 mt-2 mb-2"
        style={{ backgroundColor: "#eeeeee" }}
      >
        <div
          className="container-fluid p-2"
          style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
        >
          <div className="contaienr"> Start a new room</div>
          <CardOptions cards={cards} cardClick={handleClick} />
          <hr />
          <form className="row" onSubmit={handleSubmit}>
            <div className="col-sm-2 m-sm-0 col-2 m-1">
              <div className="code">Code</div>
            </div>
            <div className="col-sm-4 m-sm-0 col-8 m-1">
              <input
                className="form-control"
                type="text"
                name="roomCode"
                onChange={handleChange}
                value={formData.roomCode}
              />
            </div>
            <div className="col-sm-4 m-sm-0 col-6 m-1">
              <ButtonGroup
                radioButtons={radioButtons}
                handleChange={handleChange}
              />
            </div>
            <div className="col-sm-2 m-sm-0 col-4 m-1">
              <input 
                className="btn btn-primary" 
                type="submit" 
                value="Start"
              />
            </div>
          </form>
        </div>
      </div>
    </React.StrictMode>
  );
}

export default NewRoomForm;
