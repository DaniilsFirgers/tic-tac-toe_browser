enum MessageType {
  DISCONNECT = "DISCONNECT",
  CONNECT = "CONNECT",
  GAME_START = "GAME_START",
  GAME = "GAME",
}

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

export { MessageType, BoardTile, ConnectMsg, DisconnectMsg, GameStartMsg };
