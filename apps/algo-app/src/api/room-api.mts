import type { StrictOmit } from 'ts-type-forge';
import type {
  ActionRecord,
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
  /**
   * Writes an action as the document `id`; Firestore fills in its
   * `serverTimestamp()`.
   */
  addAction: (
    roomId: string,
    record: ActionRecord<GameStateActionToWrite>,
  ) => Promise<void>;
  /**
   * Calls `onChange` with the room now and on every change, until the returned
   * function is called; with `undefined` while there is no room by that id.
   */
  watchRoom: (
    roomId: string,
    onChange: (room: Room | undefined) => void,
  ) => () => void;
  /**
   * Calls `onChange` with every action of the room, oldest first, each with its
   * document's id, now and on every change, until the returned function is
   * called. Their timestamps are as read back (`Timestamp`, or `null` while
   * pending).
   */
  watchActions: (
    roomId: string,
    onChange: (actions: readonly ActionRecord<GameStateActionFromDb>[]) => void,
  ) => () => void;
}>;
