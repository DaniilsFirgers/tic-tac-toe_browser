<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  const server = new WebSocket("ws://localhost:3006/game");

  const playerName = `Player ${uuidv4()}`;
  let playerShape = "";
  let nextMove = false;

  type boardTile = {
    id: number;
    player: string;
    hit: boolean;
    topic: string;
    shape: string;
  };

  type connectMsg = {
    topic: string;
    msg: string;
    shape: string;
    firstMove: boolean;
  };

  type disconnectMsg = {
    topic: string;
    msg: string;
    shape: string;
    player: string;
  };

  let board: boardTile[] = [
    { id: 1, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 2, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 3, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 4, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 5, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 6, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 7, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 8, player: "", hit: false, topic: "GAME", shape: "" },
    { id: 9, player: "", hit: false, topic: "GAME", shape: "" },
  ];

  server.onmessage = (event) => {
    const data: boardTile | connectMsg | disconnectMsg = JSON.parse(event.data);

    if (data.topic === "GAME") {
      const index = board.findIndex((obj) => obj.id === (data as boardTile).id);
      if (index !== -1) {
        board[index] = data as boardTile;
        checkGameBoard();

        if ((data as boardTile).player === playerName) {
          nextMove = false;
        } else {
          nextMove = true;
        }
      }
    }
    if (data.topic === "CONNECT") {
      playerShape = data.shape;
      nextMove = (data as connectMsg).firstMove;
      console.log(nextMove);
    }

    if (data.topic === "DISCONNECT") {
      playerShape = data.shape;
      const disconnectedPlayer = data as disconnectMsg;
      console.log("Disconnected player ", disconnectedPlayer);
    }
  };
  server.onclose = () => {
    const closeObject: disconnectMsg = {
      msg: `Closing server for player ${playerName}`,
      topic: "DISCONNECT",
      shape: playerShape,
      player: playerName,
    };
    const jsonCloseObj = JSON.stringify(closeObject);
    server.send(jsonCloseObj);
  };

  function submitPlayerChoice(tile: boardTile) {
    const updatedTile = {
      ...tile,
      player: playerName,
      hit: true,
      shape: playerShape,
    };

    // Convert the updated tile to a JSON string
    const jsonTile = JSON.stringify(updatedTile);
    server.send(jsonTile);
  }
  checkGameBoard();
  function checkGameBoard() {
    const combinations = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 5, 9],
      [3, 5, 7],
    ];

    combinations.forEach((combination) => {
      const res = checkObjectsAreTrueAndSameName(combination);

      if (res) {
        console.log(`${playerName} won!`);
        console.log(board);
      }
    });
  }

  function checkObjectsAreTrueAndSameName(ids) {
    const group = ids.map((id) => {
      const obj = board.find((item) => item.id === id);
      return obj && obj.hit && obj.shape;
    });
    console.log(group);
    if (group.every((item) => item)) {
      // Check if the player field is the same in all objects
      return group.every((item) => item === group[0]);
    }

    return false;
  }
</script>

<main class="h-screen flex justify-center items-center">
  <div class="">
    {#if nextMove}
      <div class="grid grid-cols-3 bg-red-500">
        {#each board as target}
          {#if target.hit === true}
            <button class="border text-white text-3xl h-28 w-28" disabled={true}
              >{target.shape}
            </button>
          {:else}
            <button
              class="border h-28 w-28"
              on:click={() => submitPlayerChoice(target)}>{""}</button
            >
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</main>

<style>
</style>
