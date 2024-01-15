const { json } = require("body-parser");
const {
  client,
  jsonStringIntoRedis,
  getJsonFromJsonStringFromRedis,
} = require("./redis");

// Auxiliar funtions and consts
const mockRows = [
  [
    { id: "00", imageSimbleCode: "whitePiece" },
    { id: "01", imageSimbleCode: "brow" },
    { id: "02", imageSimbleCode: "whitePiece" },
    { id: "03", imageSimbleCode: "brow" },
    { id: "04", imageSimbleCode: "whitePiece" },
    { id: "05", imageSimbleCode: "brow" },
    { id: "06", imageSimbleCode: "whitePiece" },
    { id: "07", imageSimbleCode: "brow" },
  ],
  [
    { id: "10", imageSimbleCode: "brow" },
    { id: "11", imageSimbleCode: "whitePiece" },
    { id: "12", imageSimbleCode: "brow" },
    { id: "13", imageSimbleCode: "whitePiece" },
    { id: "14", imageSimbleCode: "brow" },
    { id: "15", imageSimbleCode: "whitePiece" },
    { id: "16", imageSimbleCode: "brow" },
    { id: "17", imageSimbleCode: "whitePiece" },
  ],
  [
    { id: "20", imageSimbleCode: "whitePiece" },
    { id: "21", imageSimbleCode: "brow" },
    { id: "22", imageSimbleCode: "whitePiece" },
    { id: "23", imageSimbleCode: "brow" },
    { id: "24", imageSimbleCode: "whitePiece" },
    { id: "25", imageSimbleCode: "brow" },
    { id: "26", imageSimbleCode: "whitePiece" },
    { id: "27", imageSimbleCode: "brow" },
  ],
  [
    { id: "30", imageSimbleCode: "brow" },
    { id: "31", imageSimbleCode: "wood" },
    { id: "32", imageSimbleCode: "brow" },
    { id: "33", imageSimbleCode: "wood" },
    { id: "34", imageSimbleCode: "brow" },
    { id: "35", imageSimbleCode: "wood" },
    { id: "36", imageSimbleCode: "brow" },
    { id: "37", imageSimbleCode: "wood" },
  ],
  [
    { id: "40", imageSimbleCode: "wood" },
    { id: "41", imageSimbleCode: "brow" },
    { id: "42", imageSimbleCode: "wood" },
    { id: "43", imageSimbleCode: "brow" },
    { id: "44", imageSimbleCode: "wood" },
    { id: "45", imageSimbleCode: "brow" },
    { id: "46", imageSimbleCode: "wood" },
    { id: "47", imageSimbleCode: "brow" },
  ],
  [
    { id: "50", imageSimbleCode: "brow" },
    { id: "51", imageSimbleCode: "redPiece" },
    { id: "52", imageSimbleCode: "brow" },
    { id: "53", imageSimbleCode: "redPiece" },
    { id: "54", imageSimbleCode: "brow" },
    { id: "55", imageSimbleCode: "redPiece" },
    { id: "56", imageSimbleCode: "brow" },
    { id: "57", imageSimbleCode: "redPiece" },
  ],
  [
    { id: "60", imageSimbleCode: "redPiece" },
    { id: "61", imageSimbleCode: "brow" },
    { id: "62", imageSimbleCode: "redPiece" },
    { id: "63", imageSimbleCode: "brow" },
    { id: "64", imageSimbleCode: "redPiece" },
    { id: "65", imageSimbleCode: "brow" },
    { id: "66", imageSimbleCode: "redPiece" },
    { id: "67", imageSimbleCode: "brow" },
  ],
  [
    { id: "70", imageSimbleCode: "brow" },
    { id: "71", imageSimbleCode: "redPiece" },
    { id: "72", imageSimbleCode: "brow" },
    { id: "73", imageSimbleCode: "redPiece" },
    { id: "74", imageSimbleCode: "brow" },
    { id: "75", imageSimbleCode: "redPiece" },
    { id: "76", imageSimbleCode: "brow" },
    { id: "77", imageSimbleCode: "redPiece" },
  ],
];

async function getNewStartCellsRowsList() {
  return JSON.parse(JSON.stringify(mockRows));
}

async function userNameBySimble(simble, players) {
  return simble === "x" ? players[0].userName : players[1].userName;
}

async function winCondition(cellsRows, players) {
  //possible win combinations
  const auxArr = [
    [
      cellsRows[0][0].imageSimbleCode,
      cellsRows[0][1].imageSimbleCode,
      cellsRows[0][2].imageSimbleCode,
    ], //horizontal win combinations
    [
      cellsRows[1][0].imageSimbleCode,
      cellsRows[1][1].imageSimbleCode,
      cellsRows[1][2].imageSimbleCode,
    ],
    [
      cellsRows[2][0].imageSimbleCode,
      cellsRows[2][1].imageSimbleCode,
      cellsRows[2][2].imageSimbleCode,
    ],
    [
      cellsRows[0][0].imageSimbleCode,
      cellsRows[1][0].imageSimbleCode,
      cellsRows[2][0].imageSimbleCode,
    ], //vertical win combinations
    [
      cellsRows[0][1].imageSimbleCode,
      cellsRows[1][1].imageSimbleCode,
      cellsRows[2][1].imageSimbleCode,
    ],
    [
      cellsRows[0][2].imageSimbleCode,
      cellsRows[1][2].imageSimbleCode,
      cellsRows[2][2].imageSimbleCode,
    ],
    [
      cellsRows[0][0].imageSimbleCode,
      cellsRows[1][1].imageSimbleCode,
      cellsRows[2][2].imageSimbleCode,
    ], //diagonal win combinations
    [
      cellsRows[0][2].imageSimbleCode,
      cellsRows[1][1].imageSimbleCode,
      cellsRows[2][0].imageSimbleCode,
    ],
  ];

  let filledRowsCounter = 0;

  for (let arr of auxArr) {
    if (arr.includes("blank")) {
      continue;
    }
    filledRowsCounter += 1;

    if (arr.includes("circle") && !arr.includes("x")) {
      return await userNameBySimble("circle", players);
    }

    if (arr.includes("x") && !arr.includes("circle")) {
      return await userNameBySimble("x", players);
    }
  }

  if (filledRowsCounter === auxArr.length) {
    //All rows are filled but no player won!
    return "draw";
  }

  //no winner yet!
  return false;
}

async function createNewCheckersRoom(roomCode) {
  roomJson = {
    roomType: "Checkers",
    cellsRows: await getNewStartCellsRowsList(),
    playerOfTheTurn: null,
    players: [],
    redPiecesNumber: 12,
    whitePiecesNumber: 12,
    selectedPieceId: null,
    yellowPicesIds: [],
    highlightedPiecesIds: [],
    greenPiecesIds: [],
    state: "pre-start",
  };
  await jsonStringIntoRedis(roomCode, roomJson);
}

async function getRandomPlayerOfTheTurn(players) {
  const index = Math.floor(Math.random() * players.length);
  return players[index].userName;
}

async function getPlayerSimble(arr, userName) {
  if (arr[0].userName == userName) {
    return "x";
  }

  if (arr[1].userName == userName) {
    return "circle";
  }
}

async function getNextPlayerOfTheTurn(players, currentPlayerOfTheTurn) {
  if (players[0].userName === currentPlayerOfTheTurn) {
    return players[1].userName;
  }

  if (players[1].userName === currentPlayerOfTheTurn) {
    return players[0].userName;
  }
}

async function removePlayerByUsername(arr, userName) {
  for (i in arr) {
    if (arr[i].userName === userName) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

async function numberOfReadyPlayers(arr) {
  let counter = 0;
  for (player of arr) {
    if (player.state === "READY") {
      counter = counter + 1;
    }
  }

  return counter;
}

async function getPlayerStateByUsername(arr, userName) {
  for (player of arr) {
    if (player.userName == userName) {
      return player.state;
    }
  }

  return null;
}

async function setPlayersSatate(arr, state) {
  for (i in arr) {
    arr[i].state = state;
  }

  return arr;
}

async function setPlayerSatate(arr, userName, state) {
  for (i in arr) {
    if (arr[i].userName === userName) {
      arr[i].state = state;
    }
  }

  return arr;
}

async function getPlayerByUsername(arr, userName) {
  for (player of arr) {
    if (player.userName === userName) {
      return player;
    }
  }

  return false;
}

async function isPlayerAFKByUsername(arr, userName) {
  for (player of arr) {
    if (player.state === "AFK" && player.userName === userName) {
      return true;
    }
  }

  return false;
}

async function checkersConnectionValidator(roomCode, newUsername) {
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  if (!roomJson) {
    return { erro: true, status: 404, message: `Room ${roomCode} not found!` };
  }

  if (roomJson.players.length === 2) {
    if (await isPlayerAFKByUsername(roomJson.players, newUsername)) {
      return {
        erro: false,
        status: 200,
        message: "AFK user waiting for reconnection!",
      };
    }

    return { erro: true, status: 409, message: "The Room is full" };
  }

  if (await getPlayerByUsername(roomJson.players, newUsername)) {
    return { erro: true, status: 409, message: "Nickname is already in use!" };
  }

  return { erro: false, status: 200, message: "" };
}

async function addNewPlayer(roomCode, newUserName) {
  const roomJson = await getJsonFromJsonStringFromRedis(roomCode);
  const newPlayer = { userName: newUserName, state: "CONNECTING" };
  roomJson.players.push(newPlayer);
  if (roomJson.players.length === 1) {
    roomJson.playerOfTheTurn = newUserName;
    //await jsonStringIntoRedis(roomCode, roomJson);
  }
  await jsonStringIntoRedis(roomCode, roomJson);
  /* else{
    await jsonStringIntoRedis(roomCode, roomJson);
    io.to(roomCode).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  } */

  return roomJson;
}

async function getPlayerPieceCode(players, userName) {
  let aux;
  for (let i in players) {
    if (players[i].userName === userName) {
      aux = i;
      break;
    }
  }
  if (aux === "0") {
    //////console.log("return whitePiece");
    return "whitePiece";
  } else if (aux === "1") {
    return "redPiece";
  }
}

async function getImageSimbleCodeById(cellsRows, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return cellsRows[rowIndex][cellIndex].imageSimbleCode;
}

async function setImageSimbleCodeById(roomJson, id, imageSimbleCode) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  roomJson.cellsRows[rowIndex][cellIndex].imageSimbleCode = imageSimbleCode;
}

async function setImageSimbleCodeAsHighlightedById(roomJson, id) {
  const imageSimbleCode = await getImageSimbleCodeById(roomJson.cellsRows, id);
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  roomJson.cellsRows[rowIndex][
    cellIndex
  ].imageSimbleCode = `${imageSimbleCode}Highlight`;
}

async function isYellowPice(cellsRows, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return cellsRows[rowIndex][cellIndex].imageSimbleCode === "yellow";
}

async function changePlayerOfTheTurn(roomJson) {
  for (let player of roomJson.players) {
    if (player.userName !== roomJson.playerOfTheTurn) {
      roomJson.playerOfTheTurn = player.userName;
      break;
    }
  }
}

async function movePiece(roomJson, targetId) {
  for (id of roomJson.yellowPicesIds) {
    await setImageSimbleCodeById(roomJson, id, "wood");
  }
  roomJson.yellowPicesIds = [];

  const selectedPieceId = roomJson.selectedPieceId;
  const imageSimbleCode = await getImageSimbleCodeById(
    roomJson.cellsRows,
    selectedPieceId
  );
  await setImageSimbleCodeById(roomJson, targetId, imageSimbleCode);
  await setImageSimbleCodeById(roomJson, selectedPieceId, "wood");
  roomJson.selectedPieceId = null;
}

async function doesPieceIdBelongToUser(roomJson, userName, id) {
  const imageSimbleCode = await getImageSimbleCodeById(roomJson.cellsRows, id);

  if (!imageSimbleCode.includes("Piece")) {
    return false;
  }

  const playerPieceCode = await getPlayerPieceCode(roomJson.players, userName);

  return (
    imageSimbleCode.includes("white") === playerPieceCode.includes("white")
  );
  /* return (
    imageSimbleCode === playerPieceCode ||
    imageSimbleCode === playerPieceCode + "Highlight"
  ); */
}

async function validIndexs(indexs) {
  return indexs[0] >= 0 && indexs[0] < 8 && indexs[1] >= 0 && indexs[1] < 8;
}

async function setYellowPicesForMovement(roomJson, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  const imageSimbleCode = await getImageSimbleCodeById(roomJson.cellsRows, id);
  if (["whitePiece", "whitePieceHighlight"].includes(imageSimbleCode)) {
    const bottomLeftArray = [rowIndex + 1, cellIndex - 1];
    const bottomRightArray = [rowIndex + 1, cellIndex + 1];
    if (await validIndexs(bottomLeftArray)) {
      const bottomLeftId = bottomLeftArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, bottomLeftId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomLeftId, "yellow");
        roomJson.yellowPicesIds.push(bottomLeftId);
      }
    }
    if (await validIndexs(bottomRightArray)) {
      const bottomRightId = bottomRightArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, bottomRightId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomRightId, "yellow");
        roomJson.yellowPicesIds.push(bottomRightId);
      }
    }
  } else if (["redPiece", "redPieceHighlight"].includes(imageSimbleCode)) {
    const topLeftArray = [rowIndex - 1, cellIndex - 1];
    const topRightArray = [rowIndex - 1, cellIndex + 1];
    if (await validIndexs(topLeftArray)) {
      const topLeftId = topLeftArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, topLeftId)) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topLeftId, "yellow");
        roomJson.yellowPicesIds.push(topLeftId);
      }
    }
    if (await validIndexs(topRightArray)) {
      const topRightId = topRightArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, topRightId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topRightId, "yellow");
        roomJson.yellowPicesIds.push(topRightId);
      }
    }
  } else if (imageSimbleCode.includes("Crown")) {
    const bottomLeftArray = [rowIndex + 1, cellIndex - 1];
    const bottomRightArray = [rowIndex + 1, cellIndex + 1];
    if (await validIndexs(bottomLeftArray)) {
      const bottomLeftId = bottomLeftArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, bottomLeftId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomLeftId, "yellow");
        roomJson.yellowPicesIds.push(bottomLeftId);
      }
    }
    if (await validIndexs(bottomRightArray)) {
      const bottomRightId = bottomRightArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, bottomRightId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomRightId, "yellow");
        roomJson.yellowPicesIds.push(bottomRightId);
      }
    }
    const topLeftArray = [rowIndex - 1, cellIndex - 1];
    const topRightArray = [rowIndex - 1, cellIndex + 1];
    if (await validIndexs(topLeftArray)) {
      const topLeftId = topLeftArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, topLeftId)) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topLeftId, "yellow");
        roomJson.yellowPicesIds.push(topLeftId);
      }
    }
    if (await validIndexs(topRightArray)) {
      const topRightId = topRightArray.join("");
      if (
        (await getImageSimbleCodeById(roomJson.cellsRows, topRightId)) ===
        "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topRightId, "yellow");
        roomJson.yellowPicesIds.push(topRightId);
      }
    }
  }
}

async function areYellowPicesSeted(roomJson) {
  return roomJson.yellowPicesIds.length > 0;
}

async function unsetYellowPiecesForMovement(roomJson) {
  let rowIndex;
  let cellIndex;
  for (id of roomJson.yellowPicesIds) {
    rowIndex = parseInt(id[0]);
    cellIndex = parseInt(id[1]);
    roomJson.cellsRows[rowIndex][cellIndex].imageSimbleCode = "wood";
  }
}

async function unsetGreenPiecesForCatch(roomJson) {
  let rowIndex;
  let cellIndex;
  for (id of roomJson.greenPiecesIds) {
    rowIndex = parseInt(id[0]);
    cellIndex = parseInt(id[1]);
    roomJson.cellsRows[rowIndex][cellIndex].imageSimbleCode = "wood";
  }
  roomJson.greenPiecesIds = [];
}

async function unsetHighlightedPieces(roomJson) {
  let rowIndex;
  let cellIndex;
  let imageSimbleCode;
  for (id of roomJson.highlightedPiecesIds) {
    rowIndex = parseInt(id[0]);
    cellIndex = parseInt(id[1]);
    imageSimbleCode = roomJson.cellsRows[rowIndex][cellIndex].imageSimbleCode;
    roomJson.cellsRows[rowIndex][cellIndex].imageSimbleCode =
      imageSimbleCode.replace("Highlight", "");
  }
  roomJson.highlightedPiecesIds = [];
}

async function topLeftCoordinates(id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return [rowIndex - 1, cellIndex - 1];
}

async function topRightCoordinates(id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return [rowIndex - 1, cellIndex + 1];
}

async function bottomLeftCoordinates(id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return [rowIndex + 1, cellIndex - 1];
}

async function bottomRightCoordinates(id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return [rowIndex + 1, cellIndex + 1];
}

async function setHghlightedPiecesForCatch(roomJson) {
  let aux = 0;
  const playerUserName = roomJson.playerOfTheTurn;
  const playerPieceCode = await getPlayerPieceCode(
    roomJson.players,
    playerUserName
  );

  if (playerPieceCode === "whitePiece") {
    let bottomLeftArr;
    let bottomRightArr;
    for (row of roomJson.cellsRows) {
      for (cell of row) {
        aux = aux + 1;
        if (cell.imageSimbleCode.includes("white")) {
          bottomLeftArr = await bottomLeftCoordinates(cell.id);
          if (
            (await validIndexs(bottomLeftArr.join(""))) &&
            (await getImageSimbleCodeById(
              roomJson.cellsRows,
              bottomLeftArr.join("")
            )).includes("red")
          ) {
            bottomLeftArr = await bottomLeftCoordinates(bottomLeftArr.join(""));
            if (
              (await validIndexs(bottomLeftArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                bottomLeftArr.join("")
              )) === "wood"
            ) {
              await setImageSimbleCodeAsHighlightedById(
                roomJson,
                cell.id
              );
              roomJson.highlightedPiecesIds.push(cell.id);
              continue;
            }
          }
          bottomRightArr = await bottomRightCoordinates(cell.id);
          if (
            (await validIndexs(bottomRightArr.join(""))) &&
            (await getImageSimbleCodeById(
              roomJson.cellsRows,
              bottomRightArr.join("")
            )).includes("red")
          ) {
            bottomRightArr = await bottomRightCoordinates(
              bottomRightArr.join("")
            );
            if (
              (await validIndexs(bottomRightArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                bottomRightArr.join("")
              )) === "wood"
            ) {
              await setImageSimbleCodeAsHighlightedById(
                roomJson,
                cell.id
              );
              roomJson.highlightedPiecesIds.push(cell.id);
              continue;
            }
          }
          if (cell.imageSimbleCode.includes("Crown")) {
            topLeftArr = await topLeftCoordinates(cell.id);
            if (
              (await validIndexs(topLeftArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                topLeftArr.join("")
              )).includes("red")
            ) {
              topLeftArr = await topLeftCoordinates(topLeftArr.join(""));
              if (
                (await validIndexs(topLeftArr.join(""))) &&
                (await getImageSimbleCodeById(
                  roomJson.cellsRows,
                  topLeftArr.join("")
                )) === "wood"
              ) {
                await setImageSimbleCodeAsHighlightedById(
                  roomJson,
                  cell.id
                );
                roomJson.highlightedPiecesIds.push(cell.id);
                continue;
              }
            }
            topRightArr = await topRightCoordinates(cell.id);
            if (
              (await validIndexs(topRightArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                topRightArr.join("")
              )).includes("red")
            ) {
              topRightArr = await topRightCoordinates(topRightArr.join(""));
              if (
                (await validIndexs(topRightArr.join(""))) &&
                (await getImageSimbleCodeById(
                  roomJson.cellsRows,
                  topRightArr.join("")
                )) === "wood"
              ) {
                await setImageSimbleCodeAsHighlightedById(
                  roomJson,
                  cell.id
                );
                roomJson.highlightedPiecesIds.push(cell.id);
                continue;
              }
            }
          }
        }
      }
    }
  }
  if (playerPieceCode === "redPiece") {
    let topLeftArr;
    let topRightArr;
    for (row of roomJson.cellsRows) {
      for (cell of row) {
        aux = aux + 1;
        if (cell.imageSimbleCode.includes("red")) {
          topLeftArr = await topLeftCoordinates(cell.id);
          if (
            (await validIndexs(topLeftArr.join(""))) &&
            (await getImageSimbleCodeById(
              roomJson.cellsRows,
              topLeftArr.join("")
            )).includes("white")
          ) {
            topLeftArr = await topLeftCoordinates(topLeftArr.join(""));
            if (
              (await validIndexs(topLeftArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                topLeftArr.join("")
              )) === "wood"
            ) {
              await setImageSimbleCodeAsHighlightedById(
                roomJson,
                cell.id
              );
              roomJson.highlightedPiecesIds.push(cell.id);
              continue;
            }
          }
          topRightArr = await topRightCoordinates(cell.id);
          if (
            (await validIndexs(topRightArr.join(""))) &&
            (await getImageSimbleCodeById(
              roomJson.cellsRows,
              topRightArr.join("")
            )).includes("white")
          ) {
            topRightArr = await topRightCoordinates(topRightArr.join(""));
            if (
              (await validIndexs(topRightArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                topRightArr.join("")
              )) === "wood"
            ) {
              await setImageSimbleCodeAsHighlightedById(
                roomJson,
                cell.id
              );
              roomJson.highlightedPiecesIds.push(cell.id);
              continue;
            }
          }
          if (cell.imageSimbleCode.includes("Crown")) {
            bottomLeftArr = await bottomLeftCoordinates(cell.id);
            if (
              (await validIndexs(bottomLeftArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                bottomLeftArr.join("")
              )).includes("white")
            ) {
              bottomLeftArr = await bottomLeftCoordinates(
                bottomLeftArr.join("")
              );
              if (
                (await validIndexs(bottomLeftArr.join(""))) &&
                (await getImageSimbleCodeById(
                  roomJson.cellsRows,
                  bottomLeftArr.join("")
                )) === "wood"
              ) {
                await setImageSimbleCodeAsHighlightedById(
                  roomJson,
                  cell.id
                );
                roomJson.highlightedPiecesIds.push(cell.id);
                continue;
              }
            }
            bottomRightArr = await bottomRightCoordinates(cell.id);
            if (
              (await validIndexs(bottomRightArr.join(""))) &&
              (await getImageSimbleCodeById(
                roomJson.cellsRows,
                bottomRightArr.join("")
              )).includes("white")
            ) {
              bottomRightArr = await bottomRightCoordinates(
                bottomRightArr.join("")
              );
              if (
                (await validIndexs(bottomRightArr.join(""))) &&
                (await getImageSimbleCodeById(
                  roomJson.cellsRows,
                  bottomRightArr.join("")
                )) === "wood"
              ) {
                await setImageSimbleCodeAsHighlightedById(
                  roomJson,
                  cell.id
                );
                roomJson.highlightedPiecesIds.push(cell.id);
                continue;
              }
            }
          }
        }
      }
    }
  }
  //console.log(aux);
}

async function setGreenPieceForCatchById(roomJson, highlightedPieceId) {
  let greenPiecesSetCounter = 0;

  const imageSimbleCode = await getImageSimbleCodeById(
    roomJson.cellsRows,
    highlightedPieceId
  );

  if (imageSimbleCode.includes("white")) {
    let bottomLeftArr = await bottomLeftCoordinates(highlightedPieceId);
    if (
      (await validIndexs(bottomLeftArr.join(""))) &&
      (await getImageSimbleCodeById(
        roomJson.cellsRows,
        bottomLeftArr.join("")
      )).includes("red")
    ) {
      bottomLeftArr = await bottomLeftCoordinates(bottomLeftArr.join(""));
      if (
        (await validIndexs(bottomLeftArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          bottomLeftArr.join("")
        )) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomLeftArr.join(""), "green");
        roomJson.greenPiecesIds.push(bottomLeftArr.join(""));
        greenPiecesSetCounter += 1;
        //console.log(cell.id);
      }
    }
    bottomRightArr = await bottomRightCoordinates(highlightedPieceId);
    if (
      (await validIndexs(bottomRightArr.join(""))) &&
      (await getImageSimbleCodeById(
        roomJson.cellsRows,
        bottomRightArr.join("")
      )).includes("red")
    ) {
      bottomRightArr = await bottomRightCoordinates(bottomRightArr.join(""));
      if (
        (await validIndexs(bottomRightArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          bottomRightArr.join("")
        )) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, bottomRightArr, "green");
        roomJson.greenPiecesIds.push(bottomRightArr.join(""));
        greenPiecesSetCounter += 1;
        //console.log(cell.id);
      }
    }
    if (imageSimbleCode.includes("Crown")) {
      topLeftArr = await topLeftCoordinates(highlightedPieceId);
      if (
        (await validIndexs(topLeftArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          topLeftArr.join("")
        )).includes("red")
      ) {
        topLeftArr = await topLeftCoordinates(topLeftArr.join(""));
        if (
          (await validIndexs(topLeftArr.join(""))) &&
          (await getImageSimbleCodeById(
            roomJson.cellsRows,
            topLeftArr.join("")
          )) === "wood"
        ) {
          await setImageSimbleCodeById(roomJson, topLeftArr, "green");
          roomJson.greenPiecesIds.push(topLeftArr.join(""));
          greenPiecesSetCounter += 1;
          //console.log(cell.id);
        }
      }
      topRightArr = await topRightCoordinates(highlightedPieceId);
      if (
        (await validIndexs(topRightArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          topRightArr.join("")
        )).includes("red")
      ) {
        topRightArr = await topRightCoordinates(topRightArr.join(""));
        if (
          (await validIndexs(topRightArr.join(""))) &&
          (await getImageSimbleCodeById(
            roomJson.cellsRows,
            topRightArr.join("")
          )) === "wood"
        ) {
          await setImageSimbleCodeById(roomJson, topRightArr, "green");
          roomJson.greenPiecesIds.push(topRightArr.join(""));
          greenPiecesSetCounter += 1;
          //console.log(cell.id);
        }
      }
    }
  }
  if (imageSimbleCode.includes("red")) {
    topLeftArr = await topLeftCoordinates(highlightedPieceId);
    if (
      (await validIndexs(topLeftArr.join(""))) &&
      (await getImageSimbleCodeById(
        roomJson.cellsRows,
        topLeftArr.join("")
      )).includes("white")
    ) {
      topLeftArr = await topLeftCoordinates(topLeftArr.join(""));
      if (
        (await validIndexs(topLeftArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          topLeftArr.join("")
        )) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topLeftArr, "green");
        roomJson.greenPiecesIds.push(topLeftArr.join(""));
        greenPiecesSetCounter += 1;
        //console.log(cell.id);
      }
    }
    topRightArr = await topRightCoordinates(highlightedPieceId);
    if (
      (await validIndexs(topRightArr.join(""))) &&
      (await getImageSimbleCodeById(
        roomJson.cellsRows,
        topRightArr.join("")
      )).includes("white")
    ) {
      topRightArr = await topRightCoordinates(topRightArr.join(""));
      if (
        (await validIndexs(topRightArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          topRightArr.join("")
        )) === "wood"
      ) {
        await setImageSimbleCodeById(roomJson, topRightArr, "green");
        roomJson.greenPiecesIds.push(topRightArr.join(""));
        greenPiecesSetCounter += 1;
        //console.log(cell.id);
      }
    }
    if (imageSimbleCode.includes("Crown")) {
      let bottomLeftArr = await bottomLeftCoordinates(highlightedPieceId);
      if (
        (await validIndexs(bottomLeftArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          bottomLeftArr.join("")
        )).includes("white")
      ) {
        bottomLeftArr = await bottomLeftCoordinates(bottomLeftArr.join(""));
        if (
          (await validIndexs(bottomLeftArr.join(""))) &&
          (await getImageSimbleCodeById(
            roomJson.cellsRows,
            bottomLeftArr.join("")
          )) === "wood"
        ) {
          await setImageSimbleCodeById(
            roomJson,
            bottomLeftArr.join(""),
            "green"
          );
          roomJson.greenPiecesIds.push(bottomLeftArr.join(""));
          greenPiecesSetCounter += 1;
          //console.log(cell.id);
        }
      }
      bottomRightArr = await bottomRightCoordinates(highlightedPieceId);
      if (
        (await validIndexs(bottomRightArr.join(""))) &&
        (await getImageSimbleCodeById(
          roomJson.cellsRows,
          bottomRightArr.join("")
        )).includes("white")
      ) {
        bottomRightArr = await bottomRightCoordinates(bottomRightArr.join(""));
        if (
          (await validIndexs(bottomRightArr.join(""))) &&
          (await getImageSimbleCodeById(
            roomJson.cellsRows,
            bottomRightArr.join("")
          )) === "wood"
        ) {
          await setImageSimbleCodeById(roomJson, bottomRightArr, "green");
          roomJson.greenPiecesIds.push(bottomRightArr.join(""));
          greenPiecesSetCounter += 1;
          //console.log(cell.id);
        }
      }
    }
  }

  return greenPiecesSetCounter > 0;
}

async function isHighlightedPiece(cellsRows, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return cellsRows[rowIndex][cellIndex].imageSimbleCode.includes("Highlight");
}

async function isGreenPiece(cellsRows, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);
  return cellsRows[rowIndex][cellIndex].imageSimbleCode === "green";
}

async function getSelectedCatchPieceId(selectedPieceId, targetId) {
  const selectedPieceRowIndex = parseInt(selectedPieceId[0]);
  const selectedPieceCellIndex = parseInt(selectedPieceId[1]);
  const targetIdRowIndex = parseInt(targetId[0]);
  const targetIdCellIndex = parseInt(targetId[1]);
  let catchPieceRowIndex;
  let catchPieceCellIndex;

  if (selectedPieceRowIndex > targetIdRowIndex) {
    catchPieceRowIndex = selectedPieceRowIndex - 1;
  } else {
    catchPieceRowIndex = selectedPieceRowIndex + 1;
  }

  if (selectedPieceCellIndex > targetIdCellIndex) {
    catchPieceCellIndex = selectedPieceCellIndex - 1;
  } else {
    catchPieceCellIndex = selectedPieceCellIndex + 1;
  }

  return `${catchPieceRowIndex}${catchPieceCellIndex}`;
}

async function catchPiece(roomJson, id) {
  const selectedPieceId = roomJson.selectedPieceId;
  const catchedPieceId = await getSelectedCatchPieceId(selectedPieceId, id);

  const selectedPieceImageSimbleCode = await getImageSimbleCodeById(
    roomJson.cellsRows,
    selectedPieceId
  );

  const catchedPieceIdImageSimbleCode = await getImageSimbleCodeById(roomJson.cellsRows ,catchedPieceId);
  if(catchedPieceIdImageSimbleCode.includes("white")){
    roomJson.whitePiecesNumber -= 1;
  }else if(catchedPieceIdImageSimbleCode.includes("red")) {
    roomJson.redPiecesNumber -= 1;
  }

  await setImageSimbleCodeById(roomJson, catchedPieceId, "wood");
  await setImageSimbleCodeById(roomJson, selectedPieceId, "wood");
  await setImageSimbleCodeById(roomJson, id, selectedPieceImageSimbleCode);
  const index = roomJson.greenPiecesIds.indexOf(id);
  roomJson.greenPiecesIds.splice(index, 1);

}

async function setPieceAsCrown(roomJson, id) {
  const rowIndex = parseInt(id[0]);
  const cellIndex = parseInt(id[1]);

  if (rowIndex !== 0 && rowIndex !== 7) {
    return false;
  }

  const imageSimbleCode = await getImageSimbleCodeById(roomJson.cellsRows, id);

  if (!imageSimbleCode.includes("Piece")) {
    return false;
  }

  if (imageSimbleCode.includes("Crown")) {
    return false;
  }

  await setImageSimbleCodeById(roomJson, id, `${imageSimbleCode}Crown`);

  return true;
}

async function getOponentUserName(roomJson){
  for (let player of roomJson.players) {
    if (player.userName !== roomJson.playerOfTheTurn) {
      return player.userName;
    }
  }
}

async function isPlayerOutOfPieces(roomJson, playerUserName){
  const playerImageSimbleCode = await getPlayerPieceCode(roomJson.players, playerUserName);
  
  if(playerImageSimbleCode === "whitePiece"){
    return roomJson.whitePiecesNumber === 0;
  }
  
  if(playerImageSimbleCode === "redPiece"){
    return roomJson.redPiecesNumber === 0;
  }
}

async function checkIfPieceCanMove(cellsRows, cell){
  const imageSimbleCode = cell.imageSimbleCode;
  const id = cell.id;

  if(imageSimbleCode.includes("Crown")){
    const bottomLeftArr = await bottomLeftCoordinates(id);
    const bottomRightArr = await bottomRightCoordinates(id);
    const topLeftArr = await topLeftCoordinates(id);
    const topRightArr = await topRightCoordinates(id);

    if(await validIndexs(bottomLeftArr)){
      if(await getImageSimbleCodeById(cellsRows, bottomLeftArr) === "wood"){
        return true;
      }
    }
    if(await validIndexs(bottomRightArr)){
      if(await getImageSimbleCodeById(cellsRows, bottomRightArr) === "wood"){
        return true;
      }
    }
    if(await validIndexs(topLeftArr)){
      if(await getImageSimbleCodeById(cellsRows, topLeftArr) === "wood"){
        return true;
      }
    }
    if(await validIndexs(topRightArr)){
      if(await getImageSimbleCodeById(cellsRows, topRightArr) === "wood"){
        return true;
      }
    }

    return false;
  }

  if(imageSimbleCode.includes("white")){
    const bottomLeftArr = await bottomLeftCoordinates(id);
    const bottomRightArr = await bottomRightCoordinates(id);

    if(await validIndexs(bottomLeftArr)){
      if(await getImageSimbleCodeById(cellsRows, bottomLeftArr) === "wood"){
        return true;
      }
    }
    if(await validIndexs(bottomRightArr)){
      if(await getImageSimbleCodeById(cellsRows, bottomRightArr) === "wood"){
        return true;
      }
    }

    return false;
  }

  if(imageSimbleCode.includes("red")){
    const topLeftArr = await topLeftCoordinates(id);
    const topRightArr = await topRightCoordinates(id);

    if(await validIndexs(topLeftArr)){
      if(await getImageSimbleCodeById(cellsRows, topLeftArr) === "wood"){
        return true;
      }
    }
    if(await validIndexs(topRightArr)){
      if(await getImageSimbleCodeById(cellsRows, topRightArr) === "wood"){
        return true;
      }
    }

    return false;
  }

  return false;

}

async function isPlayerLocked(roomJson, playerUserName){
  const imageSimbleCode = await getPlayerPieceCode(roomJson.players, playerUserName);
  const color = imageSimbleCode.includes("white") ? "white" : "red";

  for(row of roomJson.cellsRows){
    for(cell of row){
      if(cell.imageSimbleCode.includes(color)){
        if(await checkIfPieceCanMove(roomJson.cellsRows, cell)){
          return false;
        }
      }
    }
  }

  return true;
}

async function connection(socket, io) {
  const room = socket.handshake.query.room;
  const userName = socket.handshake.query.userName;
  const roomJson = await getJsonFromJsonStringFromRedis(room, userName);

  if (!roomJson) {
    socket.disconnect();
    return null;
  }

  const playerState = await getPlayerStateByUsername(
    roomJson.players,
    userName
  );

  if (playerState === "CONNECTING") {
    roomJson.players = await setPlayerSatate(
      roomJson.players,
      userName,
      "UN-READY"
    );
  } else if (playerState === "AFK") {
    roomJson.players = await setPlayerSatate(
      roomJson.players,
      userName,
      "READY"
    );
  }
  await jsonStringIntoRedis(room, roomJson);
  socket.join(room);
  io.to(room).emit("player-joins", roomJson.players, roomJson.playerOfTheTurn);
  return true;
}

async function checkersSocketHandler(socket, io) {
  const connectionStatus = await connection(socket, io);

  if (!connectionStatus) {
    return null;
  }

  async function disconnect() {
    const room = socket.handshake.query.room;

    const sockerIdMembersSet = io.sockets.adapter.rooms.get(room);
    if (!sockerIdMembersSet) {
      await client.del(room);
      return null;
    }

    const userName = socket.handshake.query.userName;
    const roomJson = await getJsonFromJsonStringFromRedis(room);

    if (roomJson.state !== "started") {
      const newArr = await removePlayerByUsername(roomJson.players, userName);
      roomJson.players = newArr;

      if (roomJson.playerOfTheTurn === userName) {
        roomJson.playerOfTheTurn = roomJson.players[0].userName;
      }
    } else {
      roomJson.players = await setPlayerSatate(
        roomJson.players,
        userName,
        "AFK"
      );
    }

    await jsonStringIntoRedis(room, roomJson);
    io.to(room).emit(
      "player-joins",
      roomJson.players,
      roomJson.playerOfTheTurn
    );
  }
  socket.on("disconnect", disconnect);

  async function playerClick(cellId) {
    const room = socket.handshake.query.room;

    const roomJson = await getJsonFromJsonStringFromRedis(room);

    if (roomJson.state !== "started") {
      return null;
    }

    const userName = socket.handshake.query.userName;

    const playerOfTheTurn = roomJson.playerOfTheTurn;

    if (playerOfTheTurn !== userName) {
      return "none";
    }

    if (await isHighlightedPiece(roomJson.cellsRows, cellId)) {
      await unsetGreenPiecesForCatch(roomJson);
      roomJson.selectedPieceId = cellId;
      await setGreenPieceForCatchById(roomJson, cellId);
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit(
        "player-click",
        roomJson.cellsRows,
        roomJson.playerOfTheTurn
      );
      return null;
    }

    if (await isGreenPiece(roomJson.cellsRows, cellId)) {
      await unsetHighlightedPieces(roomJson);
      await catchPiece(roomJson, cellId);
      await unsetGreenPiecesForCatch(roomJson);
      await setPieceAsCrown(roomJson, cellId);

      if (await setGreenPieceForCatchById(roomJson, cellId)) {
        await setImageSimbleCodeAsHighlightedById(roomJson, cellId);
        roomJson.highlightedPiecesIds.push(cellId);
        roomJson.selectedPieceId = cellId;
      } else {
        if(await isPlayerOutOfPieces(roomJson, await getOponentUserName(roomJson)) || roomJson.highlightedPiecesIds.length === 0 && await isPlayerLocked(roomJson, await getOponentUserName(roomJson))){
          const winnerPlayer = roomJson.playerOfTheTurn;
          roomJson.state = "finished";
          roomJson.players = await setPlayersSatate(roomJson.players, "UN-READY");
          roomJson.playerOfTheTurn = await getRandomPlayerOfTheTurn(roomJson.players);
          roomJson.selectedPieceId = null;
          io.to(room).emit("winner-player", roomJson.cellsRows, winnerPlayer, roomJson.state, roomJson.players);
          roomJson.cellsRows = await getNewStartCellsRowsList();
          await changePlayerOfTheTurn(roomJson);
          return null;
        }
        await changePlayerOfTheTurn(roomJson);
        await setHghlightedPiecesForCatch(roomJson);
        roomJson.selectedPieceId = null;
      }

      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit(
        "player-click",
        roomJson.cellsRows,
        roomJson.playerOfTheTurn
      );
      return null;
    }

    if ((await roomJson.highlightedPiecesIds.length) > 0) {
      if (!(await isHighlightedPiece(roomJson.cellsRows, cellId))) {
        return null;
      }
    }

    if (await isYellowPice(roomJson.cellsRows, cellId)) {
      await movePiece(roomJson, cellId);
      await setPieceAsCrown(roomJson, cellId);
      await changePlayerOfTheTurn(roomJson);
      await setHghlightedPiecesForCatch(roomJson);
      if(roomJson.highlightedPiecesIds.length === 0 && await isPlayerLocked(roomJson, roomJson.playerOfTheTurn)){
        const winnerPlayer = await getOponentUserName(roomJson);
        roomJson.state = "finished";
        roomJson.players = await setPlayersSatate(roomJson.players, "UN-READY");
        roomJson.playerOfTheTurn = await getRandomPlayerOfTheTurn(roomJson.players);
        roomJson.selectedPieceId = null;
        io.to(room).emit("winner-player", roomJson.cellsRows, winnerPlayer, roomJson.state, roomJson.players);
        roomJson.cellsRows = await getNewStartCellsRowsList();
        await jsonStringIntoRedis(room, roomJson);
        return null;
      }
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit(
        "player-click",
        roomJson.cellsRows,
        roomJson.playerOfTheTurn
      );
      return null;
    }

    if (await areYellowPicesSeted(roomJson)) {
      await unsetYellowPiecesForMovement(roomJson);
      roomJson.selectedPieceId = null;
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit(
        "player-click",
        roomJson.cellsRows,
        roomJson.playerOfTheTurn
      );
    }

    if (!(await doesPieceIdBelongToUser(roomJson, userName, cellId))) {
      return null;
    }

    roomJson.selectedPieceId = cellId;

    await setYellowPicesForMovement(roomJson, cellId);

    await jsonStringIntoRedis(room, roomJson);
    io.to(room).emit(
      "player-click",
      roomJson.cellsRows,
      roomJson.playerOfTheTurn
    );
    return null;

    const currentCellCode = cellsRows[rowIndex][cellIndex].imageSimbleCode;
    if (["x", "circle"].includes(currentCellCode)) {
      return "none";
    }

    const newImageSimbleCode = await getPlayerSimble(
      roomJson.players,
      userName
    );

    cellsRows[rowIndex][cellIndex].imageSimbleCode = newImageSimbleCode;
    const newCellsRoows = cellsRows;
    roomJson.cellsRows = newCellsRoows;

    const winnerPlayer = await winCondition(newCellsRoows, roomJson.players);

    const newPlayerOfTheTurn = await getNextPlayerOfTheTurn(
      roomJson.players,
      roomJson.playerOfTheTurn
    );
    roomJson.playerOfTheTurn = newPlayerOfTheTurn;

    //state: "pre-start"
    if (winnerPlayer) {
      roomJson.state = "finished";
      roomJson.players = await setPlayersSatate(roomJson.players, "UN-READY");
      roomJson.cellsRows = await getNewStartCellsRowsList();
      roomJson.playerOfTheTurn = await getRandomPlayerOfTheTurn(
        roomJson.players
      );
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit(
        "winner-player",
        newCellsRoows,
        winnerPlayer,
        roomJson.state,
        roomJson.players
      );
    } else {
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("player-click", newCellsRoows, newPlayerOfTheTurn);
    }
  }
  socket.on("player-click", playerClick);

  async function ready() {
    const room = socket.handshake.query.room;
    const userName = socket.handshake.query.userName;

    const roomJson = await getJsonFromJsonStringFromRedis(room);
    if (
      (await getPlayerStateByUsername(roomJson.players, userName)) === "READY"
    ) {
      socket.emit("ready", roomJson.players);
      return null;
    }

    roomJson.players = await setPlayerSatate(
      roomJson.players,
      userName,
      "READY"
    );

    if ((await numberOfReadyPlayers(roomJson.players)) === 2) {
      roomJson.state = "started";
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("ready", roomJson.players);
      io.to(room).emit(
        "start-game",
        roomJson.cellsRows,
        roomJson.playerOfTheTurn,
        roomJson.state
      );
    } else {
      await jsonStringIntoRedis(room, roomJson);
      io.to(room).emit("ready", roomJson.players);
    }
  }
  socket.on("ready", ready);
}

module.exports = {
  checkersSocketHandler: checkersSocketHandler,
  createNewCheckersRoom: createNewCheckersRoom,
  checkersConnectionValidator: checkersConnectionValidator,
  addNewPlayer: addNewPlayer,
};
