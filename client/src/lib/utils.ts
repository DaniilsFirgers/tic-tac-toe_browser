import type { BoardTile } from "../global";

const combinations: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 5, 9],
  [3, 5, 7],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

const boardTile: BoardTile[] = [
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

export { combinations, boardTile };
