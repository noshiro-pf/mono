import type { StrictOmit } from 'ts-type-forge';
import type { GameStateAction, Player, Room } from '../types/index.mjs';

/**
 * What the stores ask of the database. `firestore-room-api.mts` is the real
 * one; the tests hand the stores a fake.
 */
export type RoomApi = Readonly<{
  /** Saves a new room and resolves with the id it was given. */
  addRoom: (room: StrictOmit<Room, 'id'>) => Promise<string>;
  addPlayer: (roomId: string, player: Player) => Promise<void>;
  addAction: (roomId: string, action: GameStateAction) => Promise<void>;
  /**
   * Calls `onChange` with the room now and on every change, until the returned
   * function is called.
   */
  watchRoom: (roomId: string, onChange: (room: Room) => void) => () => void;
  /**
   * Calls `onChange` with every action of the room, oldest first, now and on
   * every change, until the returned function is called.
   */
  watchActions: (
    roomId: string,
    onChange: (actions: readonly GameStateAction[]) => void,
  ) => () => void;
}>;
