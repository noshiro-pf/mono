import type { StrictOmit } from 'ts-type-forge';
import type {
  GameStateActionFromDb,
  GameStateActionToWrite,
  PlayerWithId,
  Room,
  RoomState,
  ShuffleDef,
} from '../types/index.mjs';

/**
 * What the stores ask of the database. `firestore-room-api.mts` is the real
 * one; the tests hand the stores a fake.
 */
export type RoomApi = Readonly<{
  /** Saves a new room and resolves with the id it was given. */
  addRoom: (room: StrictOmit<Room, 'id'>) => Promise<string>;
  /**
   * Adds a player named `playerName` to the room's `players`, and resolves with
   * the id of the player's document, which the page's URL then carries.
   */
  addPlayer: (roomId: string, playerName: string) => Promise<string>;
  /** Takes the player out of the room, as leaving it before the game does. */
  removePlayer: (roomId: string, playerId: string) => Promise<void>;
  updateRoomState: (roomId: string, state: RoomState) => Promise<void>;
  /** Seats the players again, before the game starts. */
  updateShuffleDef: (roomId: string, shuffleDef: ShuffleDef) => Promise<void>;
  /** Writes an action; Firestore fills in its `serverTimestamp()`. */
  addAction: (roomId: string, action: GameStateActionToWrite) => Promise<void>;
  /**
   * Calls `onChange` with the room now and on every change, until the returned
   * function is called.
   */
  watchRoom: (roomId: string, onChange: (room: Room) => void) => () => void;
  /**
   * Calls `onChange` with the room's players, in the order they joined, now and
   * on every change, until the returned function is called.
   */
  watchPlayers: (
    roomId: string,
    onChange: (players: readonly PlayerWithId[]) => void,
  ) => () => void;
  /**
   * Calls `onChange` with every action of the room, oldest first, now and on
   * every change, until the returned function is called. Their timestamps are
   * as read back (`Timestamp`, or `null` while pending).
   */
  watchActions: (
    roomId: string,
    onChange: (actions: readonly GameStateActionFromDb[]) => void,
  ) => () => void;
}>;
