<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import {
    MessageType,
    type BoardTile,
    type ConnectMsg,
    type DisconnectMsg,
    type GameStartMsg,
  } from "./global.d";
  import { combinations, boardTile } from "./lib/utils";
  const server = new WebSocket("ws://localhost:3006/game");
  const playerName = `Player ${uuidv4()}`;
  let playerShape = "";
  let winnerName = "";
  $: currentMove = false;
  $: waitingForOtherPlayerToConnect = false;
  $: gameIsOver = false;

  let board: BoardTile[] = [...boardTile];

  server.onmessage = (event) => {
    const data: BoardTile | ConnectMsg | DisconnectMsg = JSON.parse(event.data);

    if (data.topic == MessageType.GAME) {
      const index = board.findIndex((obj) => obj.id == (data as BoardTile).id);
      if (index != -1) {
        board[index] = data as BoardTile;
        const moveRes = checkGameBoard();

        if (moveRes) {
          gameIsOver = true;
          (data as BoardTile).player == playerName
            ? (winnerName = "You")
            : (winnerName = "Other player");
          return;
        }

        if ((data as BoardTile).player == playerName) {
          currentMove = false;
        } else {
          currentMove = true;
        }
      }
    }
    if (data.topic == MessageType.CONNECT) {
      playerShape = data.shape;
      currentMove = (data as ConnectMsg).firstMove;
      waitingForOtherPlayerToConnect = currentMove;
    }

    if (data.topic == MessageType.DISCONNECT) {
      playerShape = data.shape;
      const disconnectedPlayer = data as DisconnectMsg;
    }

    if (data.topic == MessageType.GAME_START) {
      waitingForOtherPlayerToConnect = false;
    }
  };

  server.onclose = () => {
    const closeObject: DisconnectMsg = {
      msg: `Closing server for player ${playerName}`,
      topic: MessageType.DISCONNECT,
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

  function checkGameBoard() {
    let result = false;

    combinations.forEach((combination) => {
      const res = checkObjectsAreTrueAndSameName(combination);

      if (res) result = true;
    });
    return result;
  }
  checkGameBoard();

  function checkObjectsAreTrueAndSameName(ids) {
    const group = ids.map((id) => {
      const obj = board.find((item) => item.id === id);
      return obj && obj.hit && obj.shape;
    });
    if (group.every((item) => item)) {
      // Check if the player field is the same in all objects
      return group.every((item) => item === group[0]);
    }

    return false;
  }
</script>

{#if waitingForOtherPlayerToConnect}
  <div class="flex justify-center items-center">
    Wating for other player to connect....
  </div>
{/if}
{#if !waitingForOtherPlayerToConnect && !currentMove && !gameIsOver}
  <div class="h-screen flex justify-center items-center">
    Waiting for other player move...
  </div>
{/if}
<main class="h-screen flex justify-center items-center">
  <div class="">
    {#if gameIsOver}
      <div>Game over! {winnerName} won!</div>
    {/if}
    {#if currentMove && !gameIsOver}
      <div class="grid grid-cols-3 bg-red-500">
        {#each board as target}
          {#if target.hit}
            <button
              class="border text-white text-3xl h-28 w-28"
              disabled={target.hit}
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
