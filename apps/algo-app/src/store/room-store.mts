/**
 * The room the page shows: which one it is, what the database says of it, of
 * its players and of its actions, and who this player is in it. Creating and
 * joining a room are here too, since both end with the player's id.
 *
 * The database is `deps.api`, so nothing here talks to Firestore itself.
 */

import {
  createBooleanState,
  createState,
  source,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { RoomApi } from '../api/index.mjs';
import { newRoom } from '../functions/index.mjs';
import type {
  GameStateActionFromDb,
  PlayerWithId,
  Room,
} from '../types/index.mjs';

export type RoomDeps = Readonly<{
  api: RoomApi;
}>;

export type RoomStore = Readonly<{
  room: InitializedObservable<Room | undefined>;
  /** The room's players, in the order they joined. */
  players: InitializedObservable<readonly PlayerWithId[]>;
  /** Every action of the room, oldest first, each time the database has more. */
  actionsFromDb: SynstateObservable<readonly GameStateActionFromDb[]>;
  /** Watches this room instead of the one before it, once started. */
  setRoomId: (roomId: string) => void;
  /** The id of this player's document in the room's `players`. */
  myPlayerId: InitializedObservable<string | undefined>;
  /**
   * Says which player this page is, for a page opened as one: the id lives in
   * memory only, so a reload knows it only from the page's query.
   */
  setMyPlayerId: (myPlayerId: string) => void;
  createRoom: Readonly<{
    /** The room just created, with its id, and its creator's player id. */
    response: SynstateObservable<CreatedRoom>;
    isWaitingResponse: InitializedObservable<boolean>;
    /** Whether the last try could not save the room; cleared by the next. */
    hasFailed: InitializedObservable<boolean>;
    /**
     * Resolves with the room created, its creator its first player, or with why
     * either could not be saved. The name is made well-formed first.
     */
    dispatch: (
      payload: Readonly<{
        username: string;
        password: string | undefined;
      }>,
    ) => Promise<Result<Room, unknown>>;
  }>;
  joinRoom: Readonly<{
    isWaitingResponse: InitializedObservable<boolean>;
    /** Resolves with the new player's id, or with why they were not added. */
    dispatch: (
      roomId: string,
      username: string,
    ) => Promise<Result<string, unknown>>;
  }>;
  /** Starts watching the room the id names; returns what stops it. */
  start: () => () => void;
}>;

export const createRoomStore = (deps: RoomDeps): RoomStore => {
  const [roomId, setRoomId] = createState<string | undefined>(undefined);

  const [room, setRoom] = createState<Room | undefined>(undefined);

  const [players, setPlayers] = createState<readonly PlayerWithId[]>([]);

  const actionsFromDb = source<readonly GameStateActionFromDb[]>();

  const [myPlayerId, setMyPlayerId] = createState<string | undefined>(
    undefined,
  );

  const createRoom = (() => {
    const response = source<CreatedRoom>();

    const [isWaitingResponse, { setState: setIsWaitingResponse }] =
      createBooleanState(false);

    const [hasFailed, { setState: setHasFailed }] = createBooleanState(false);

    const dispatch = async (
      payload: Readonly<{
        username: string;
        password: string | undefined;
      }>,
    ): Promise<Result<Room, unknown>> => {
      // A lone surrogate (half of a pasted emoji) cannot be stored as UTF-8: it
      // is replaced first, so that the name shown is the name typed.
      const username = payload.username.toWellFormed();

      setHasFailed(false);

      setIsWaitingResponse(true);

      const added = await save({ ...payload, username });

      if (Result.isErr(added)) {
        setHasFailed(true);

        return added;
      }

      setMyPlayerId(added.value.myPlayerId);

      response.next(added.value);

      return Result.map(added, (created) => created.room);
    };

    /**
     * The room saved, or why it could not be: a throw is an `Err` as a
     * rejection is, and the waiting ends on every way out.
     */
    const save = async (
      payload: Readonly<{
        username: string;
        password: string | undefined;
      }>,
    ): Promise<Result<CreatedRoom, unknown>> => {
      try {
        return await Result.fromPromise(
          (async (): Promise<CreatedRoom> => {
            const created = newRoom(payload.password);

            const id = await deps.api.addRoom(created);

            // The creator is the room's first player, so they open it as one.
            const playerId = await deps.api.addPlayer(id, payload.username);

            return { room: { ...created, id }, myPlayerId: playerId };
          })(),
        );
      } finally {
        setIsWaitingResponse(false);
      }
    };

    return { response, isWaitingResponse, hasFailed, dispatch } as const;
  })();

  const joinRoom = (() => {
    const [isWaitingResponse, { setState: setIsWaitingResponse }] =
      createBooleanState(false);

    const dispatch = async (
      id: string,
      username: string,
    ): Promise<Result<string, unknown>> => {
      setIsWaitingResponse(true);

      // A player who could not be added has no id to go on as.
      const added = await Result.fromPromise(
        deps.api.addPlayer(id, username.toWellFormed()),
      );

      if (Result.isOk(added)) {
        setMyPlayerId(added.value);
      }

      setIsWaitingResponse(false);

      return added;
    };

    return { isWaitingResponse, dispatch } as const;
  })();

  const start = (): (() => void) => {
    const mut_watching: {
      stopRoom: (() => void) | undefined;
      stopPlayers: (() => void) | undefined;
      stopActions: (() => void) | undefined;
    } = {
      stopRoom: undefined,
      stopPlayers: undefined,
      stopActions: undefined,
    };

    const stopWatching = (): void => {
      mut_watching.stopRoom?.();

      mut_watching.stopPlayers?.();

      mut_watching.stopActions?.();

      mut_watching.stopRoom = undefined;

      mut_watching.stopPlayers = undefined;

      mut_watching.stopActions = undefined;
    };

    const subscription = roomId.subscribe((id) => {
      if (id === undefined) {
        return;
      }

      stopWatching();

      mut_watching.stopRoom = deps.api.watchRoom(id, setRoom);

      mut_watching.stopPlayers = deps.api.watchPlayers(id, setPlayers);

      mut_watching.stopActions = deps.api.watchActions(id, (actions) => {
        actionsFromDb.next(actions);
      });
    });

    return () => {
      subscription.unsubscribe();

      stopWatching();
    };
  };

  return {
    room,
    players,
    actionsFromDb,
    setRoomId,
    myPlayerId,
    setMyPlayerId,
    createRoom,
    joinRoom,
    start,
  };
};

/**
 * A room just created, and the id its creator is already a player of it by, so
 * that they open the room as that player.
 */
export type CreatedRoom = Readonly<{ room: Room; myPlayerId: string }>;
