<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  const server = new WebSocket("ws://localhost:3006/game");
  const playerName = `Player ${uuidv4()}`;
  let playerShape = "";
  $: currentMove = false;
  $: waitingForOtherPlayerToConnect = false;
  $: gameIsOver = false;

  type BoardTile = {
    id: number;
    player: string;
    hit: boolean;
    topic: string;
    shape: string;
  };

  type ConnectMsg = {
    topic: string;
    msg: string;
    shape: string;
    firstMove: boolean;
  };

  type DisconnectMsg = {
    topic: string;
    msg: string;
    shape: string;
    player: string;
  };

  type GameStartMsg = {
    topic: string;
    msg: string;
  };

  let board: BoardTile[] = [
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
    const data: BoardTile | ConnectMsg | DisconnectMsg = JSON.parse(event.data);

    if (data.topic === "GAME") {
      const index = board.findIndex((obj) => obj.id === (data as BoardTile).id);
      if (index !== -1) {
        board[index] = data as BoardTile;
        checkGameBoard();

        if ((data as BoardTile).player === playerName) {
          currentMove = false;
        } else {
          currentMove = true;
        }
      }
    }
    if (data.topic == "CONNECT") {
      playerShape = data.shape;
      currentMove = (data as ConnectMsg).firstMove;
      waitingForOtherPlayerToConnect = currentMove;
    }

    if (data.topic == "DISCONNECT") {
      playerShape = data.shape;
      const disconnectedPlayer = data as DisconnectMsg;
      console.log("Disconnected player ", disconnectedPlayer);
    }

    if (data.topic == "GAME_START") {
      waitingForOtherPlayerToConnect = false;
    }
  };
  server.onclose = () => {
    const closeObject: DisconnectMsg = {
      msg: `Closing server for player ${playerName}`,
      topic: "DISCONNECT",
      shape: playerShape,
      player: playerName,
    };
    const jsonCloseObj = JSON.stringify(closeObject);
    server.send(jsonCloseObj);
  };

  function submitPlayerChoice(tile: BoardTile) {
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

      if (res) gameIsOver = true;
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

{#if waitingForOtherPlayerToConnect}
  <div>Wating for other player to connect....</div>
{/if}
{#if !waitingForOtherPlayerToConnect && !currentMove && !gameIsOver}
  <div class="h-screen flex justify-center items-center">
    Waiting for other player move...
  </div>
{/if}
<main class="h-screen flex justify-center items-center">
  <div class="">
    {#if gameIsOver}
      <div>Game over!</div>
    {/if}
    {#if currentMove && !gameIsOver}
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
