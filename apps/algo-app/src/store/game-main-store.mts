/**
 * What the game screen does to the room itself before the game starts: seat the
 * players again, start the game, and let a player leave. Each is a write to the
 * room; what it changes comes back through the room's watch.
 */

import {
  combine,
  createBooleanState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { RoomApi } from '../api/index.mjs';
import type { Room, ShuffleDef } from '../types/index.mjs';

export type GameMainDeps = Readonly<{
  api: StrictPick<
    RoomApi,
    'removePlayer' | 'updateRoomState' | 'updateShuffleDef'
  >;
  room: InitializedObservable<Room | undefined>;
  myPlayerId: InitializedObservable<string | undefined>;
  newShuffleDef: () => ShuffleDef;
}>;

export type GameMainStore = Readonly<{
  /** While seating again or starting is being written. */
  shuffleSeatsButtonDisabled: InitializedObservable<boolean>;
  onShuffleSeatsClick: () => void;
  onStartGameClick: () => void;
  /**
   * Takes this player out of the room; resolves with the room's id once they
   * are out, for the page to go back to the room's join form.
   */
  exit: () => Promise<Result<string, unknown>>;
}>;

export const createGameMainStore = (deps: GameMainDeps): GameMainStore => {
  const [shuffleSeatsWaiting, { setState: setShuffleSeatsWaiting }] =
    createBooleanState(false);

  const [startGameWaiting, { setState: setStartGameWaiting }] =
    createBooleanState(false);

  const shuffleSeatsButtonDisabled = combine([
    shuffleSeatsWaiting,
    startGameWaiting,
  ]).pipe(map(([a, b]) => a || b));

  const currentRoomId = (): string | undefined =>
    deps.room.getSnapshot().value?.id;

  const onShuffleSeatsClick = (): void => {
    const roomId = currentRoomId();

    if (roomId === undefined) {
      return;
    }

    setShuffleSeatsWaiting(true);

    Result.fromPromise(deps.api.updateShuffleDef(roomId, deps.newShuffleDef()))
      .then((res) => {
        if (Result.isErr(res)) {
          console.error(res.value);
        }

        setShuffleSeatsWaiting(false);
      })
      .catch(console.error);
  };

  const onStartGameClick = (): void => {
    const roomId = currentRoomId();

    if (roomId === undefined) {
      return;
    }

    setStartGameWaiting(true);

    Result.fromPromise(deps.api.updateRoomState(roomId, 'playing'))
      .then((res) => {
        if (Result.isErr(res)) {
          console.error(res.value);
        }

        setStartGameWaiting(false);
      })
      .catch(console.error);
  };

  const exit = async (): Promise<Result<string, unknown>> => {
    const roomId = currentRoomId();

    const playerId = deps.myPlayerId.getSnapshot().value;

    if (roomId === undefined || playerId === undefined) {
      return Result.err(new Error('not in a room'));
    }

    const res = await Result.fromPromise(
      deps.api.removePlayer(roomId, playerId),
    );

    return Result.map(res, () => roomId);
  };

  return {
    shuffleSeatsButtonDisabled,
    onShuffleSeatsClick,
    onStartGameClick,
    exit,
  };
};
