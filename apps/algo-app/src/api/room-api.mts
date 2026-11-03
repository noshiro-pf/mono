import type { StrictOmit } from 'ts-type-forge';
import type {
  GameStateActionFromDb,
  GameStateActionToWrite,
  Player,
  Room,
} from '../types/index.mjs';

/**
 * What the stores ask of the database. `firestore-room-api.mts` is the real
 * one; the tests hand the stores a fake.
 */
export type RoomApi = Readonly<{
  /** Saves a new room and resolves with the id it was given. */
  addRoom: (room: StrictOmit<Room, 'id'>) => Promise<string>;
  addPlayer: (roomId: string, player: Player) => Promise<void>;
  /** Writes an action; Firestore fills in its `serverTimestamp()`. */
  addAction: (roomId: string, action: GameStateActionToWrite) => Promise<void>;
  /**
   * Calls `onChange` with the room now and on every change, until the returned
   * function is called.
   */
  watchRoom: (roomId: string, onChange: (room: Room) => void) => () => void;
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
