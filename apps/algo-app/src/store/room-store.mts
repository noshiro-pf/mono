/**
 * The room the page shows: which one it is, what the database says of it and of
 * its actions, and who this player is in it. Creating and joining a room are
 * here too, since both end with the player's name.
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
import { Arr, Result } from 'ts-data-forge';
import type { RoomApi } from '../api/index.mjs';
import { newRoom } from '../functions/index.mjs';
import type { GameStateActionFromDb, Room } from '../types/index.mjs';

export type RoomDeps = Readonly<{
  api: RoomApi;
}>;

export type RoomStore = Readonly<{
  room: InitializedObservable<Room | undefined>;
  /** Whether the database has no room by the id watched. */
  isRoomMissing: InitializedObservable<boolean>;
  /** Every action of the room, oldest first, each time the database has more. */
  actionsFromDb: SynstateObservable<readonly GameStateActionFromDb[]>;
  /** Watches this room instead of the one before it, once started. */
  setRoomId: (roomId: string) => void;
  myName: InitializedObservable<string | undefined>;
  /**
   * Names this player, for a page opened as one: the name lives in memory only,
   * so a reload knows it only from the page's query.
   */
  setMyName: (myName: string) => void;
  createRoom: Readonly<{
    /** The room just created, with its id, and its creator's name. */
    response: SynstateObservable<CreatedRoom>;
    isWaitingResponse: InitializedObservable<boolean>;
    /** Whether the last try could not save the room; cleared by the next. */
    hasFailed: InitializedObservable<boolean>;
    /**
     * Resolves with the room created, or with why it could not be saved. The
     * name is made well-formed first; `response` carries the name used.
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
    /**
     * Adds this player to the room watched and takes the name, which it
     * resolves with, the spaces at its ends taken off; or resolves with why it
     * could not, adding no one and taking no name.
     */
    dispatch: (
      roomId: string,
      username: string,
    ) => Promise<Result<string, JoinRoomError>>;
  }>;
  /** Starts watching the room the id names; returns what stops it. */
  start: () => () => void;
}>;

export const createRoomStore = (deps: RoomDeps): RoomStore => {
  const [roomId, setRoomId] = createState<string | undefined>(undefined);

  const [room, setRoom] = createState<Room | undefined>(undefined);

  const [isRoomMissing, setIsRoomMissing] = createState<boolean>(false);

  const actionsFromDb = source<readonly GameStateActionFromDb[]>();

  const [myName, setMyName] = createState<string | undefined>(undefined);

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
      // The room page's URL carries the name, and a lone surrogate (half of a
      // pasted emoji) cannot be written into one: it is replaced first, so that
      // the room and the URL hold the same name.
      const username = payload.username.toWellFormed();

      setHasFailed(false);

      setIsWaitingResponse(true);

      const added = await save({ ...payload, username });

      if (Result.isErr(added)) {
        setHasFailed(true);

        return added;
      }

      setMyName(username);

      response.next({ room: added.value, myName: username });

      return added;
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
    ): Promise<Result<Room, unknown>> => {
      try {
        return await Result.fromPromise(
          (async (): Promise<Room> => {
            const created = newRoom(payload.password, {
              name: payload.username,
              online: true,
            });

            const id = await deps.api.addRoom(created);

            return { ...created, id };
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
    ): Promise<Result<string, JoinRoomError>> => {
      const name = username.trim();

      const refused = refusalOf(room.getSnapshot().value, id, name);

      if (refused !== undefined) {
        return Result.err(refused);
      }

      setIsWaitingResponse(true);

      const added = await Result.fromPromise(
        deps.api.addPlayer(id, { name, online: true }),
      );

      setIsWaitingResponse(false);

      if (Result.isErr(added)) {
        return Result.err('addFailed');
      }

      setMyName(name);

      return Result.ok(name);
    };

    return { isWaitingResponse, dispatch } as const;
  })();

  const start = (): (() => void) => {
    const mut_watching: {
      stopRoom: (() => void) | undefined;
      stopActions: (() => void) | undefined;
    } = {
      stopRoom: undefined,
      stopActions: undefined,
    };

    const stopWatching = (): void => {
      mut_watching.stopRoom?.();

      mut_watching.stopActions?.();

      mut_watching.stopRoom = undefined;

      mut_watching.stopActions = undefined;
    };

    const subscription = roomId.subscribe((id) => {
      if (id === undefined) {
        return;
      }

      stopWatching();

      setIsRoomMissing(false);

      mut_watching.stopRoom = deps.api.watchRoom(id, (watched) => {
        setIsRoomMissing(watched === undefined);

        setRoom(watched);
      });

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
    isRoomMissing,
    actionsFromDb,
    setRoomId,
    myName,
    setMyName,
    createRoom,
    joinRoom,
    start,
  };
};

/**
 * A room just created, and the name its creator is already a player of it by,
 * so that they open the room as that player.
 */
export type CreatedRoom = Readonly<{ room: Room; myName: string }>;

/** Why a player could not join a room. */
export type JoinRoomError =
  'nameBlank' | 'roomMissing' | 'roomFull' | 'nameTaken' | 'addFailed';

/** How many players a room seats: one per `PlayerIndex`. */
const maxPlayers = 4;

/**
 * Why `name` cannot join the room `id` names as `current` holds it, or
 * `undefined` when it can. The name is the player's identity, so one already in
 * the room would share that player's seat.
 */
const refusalOf = (
  current: Room | undefined,
  id: string,
  name: string,
): JoinRoomError | undefined =>
  name === ''
    ? 'nameBlank'
    : current?.id !== id
      ? 'roomMissing'
      : Arr.isMinLengthArray(maxPlayers, current.players)
        ? 'roomFull'
        : current.players.some((player) => player.name === name)
          ? 'nameTaken'
          : undefined;
