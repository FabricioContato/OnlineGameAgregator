import React, { useEffect } from "react";
import { cardList } from "./cardList";
import { socket } from "./socketHandler";
import {Form, Link, redirect, useActionData } from "react-router-dom";
import { apiDomain } from "../../../domain";

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

function Card({ url, id, name, title, text, active, cardClick}) {
  const cardStyle = active
    ? { backgroundColor: "#888888", borderColor: "#888888", height: "280px" }
    : { backgroundColor: "#ffffff", borderColor: "#000000", height: "280px" };

  return (
    <div
      className="card"
      style={cardStyle}
      id={id}
      onClick={cardClick}
      name={name}
    >
      <input type="hidden" name="cardButton" value={active ? title : ""} />
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

function CardOptions({cards, cardClick}) {
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
          cardClick={() => cardClick(card.title)}
          active={card.active}
        />
      </div>
    );
  });

  return <div className="row">{cardElements}</div>;
}

export async function action(formData){
  //const formData = await request.formData();
  const cardValues = formData.getAll("cardButton");
  let activeCard = "";
  for(let value of cardValues){
    if(value !== ""){
      activeCard = value;
    }
  }
  const roomCode = formData.get("roomCode");
  
  if(activeCard === ""){
    return {form: "NewRoomForm", message: "Select a game!"};
  }

  if(roomCode === ""){
      return {form: "NewRoomForm", message: "Entar a room code!"};
  }

  else{
    const url = `${apiDomain}/newRoom`;
    const urlObj = new URLSearchParams();
    urlObj.append("roomCode", roomCode);
    urlObj.append("roomType", activeCard);
    const postJson = { method: "POST",  body: urlObj}
    const responseStatus = await fetch(url, postJson).then(response => response.status);
    if(responseStatus === 200 ){
      return redirect(`/nick/${roomCode}`);
    }else {
      return {form : "NewRoomForm", message: "This room code alredy is in use!"};
    }
  }
}

function NewRoomForm() {
  const [cards, setCards] = React.useState(cardList);
  const erro = useActionData();
  
  function handleCardClick(title){
    const cardListCopy = JSON.parse(JSON.stringify(cardList));
    for(let i in cardListCopy){
      if(cardListCopy[i].title === title){
        cardListCopy[i].active = true;
        break;
      }
    }
    setCards(cardListCopy);
  }

  return (
    <React.StrictMode>
      <Form method="post"
        className="container p-2 m-lg-2 mt-2 mb-2"
        style={{ backgroundColor: "#eeeeee" }}
      >
        <input type="hidden" name="Form" value="NewRoomForm" />
        <div
          className="container-fluid p-2"
          style={{ borderStyle: "dashed", borderColor: "#aaaaaa" }}
        >
          <div className="contaienr"> Start a new room</div>
          <CardOptions cards={cards} cardClick={handleCardClick} />
          <hr />
          <div className="row" >
            {erro && erro.form === "NewRoomForm" && <div className="col-12 d-flex justify-content-center">
              {erro.message}
            </div>}
            <div className="col-sm-2 m-sm-0 col-2 m-1">
              <div className="code">Code</div>
            </div>
            <div className="col-sm-4 m-sm-0 col-8 m-1">
              <input
                className="form-control"
                type="text"
                name="roomCode"
              />
            </div>
            {/* <div className="col-sm-4 m-sm-0 col-6 m-1">
              <ButtonGroup
                radioButtons={radioButtons}
                handleChange={handleChange}
              />
            </div> */}
            <div className="col-sm-2 m-sm-0 col-4 m-1">
              <input 
                className="btn btn-primary" 
                type="submit" 
                value="Start"
              />
            </div>
          </div>
        </div>
      </Form>
    </React.StrictMode>
  );
}

export default NewRoomForm;
