/**
 * The room the page shows: which one it is, what the database says of it and
 * of its actions, and who this player is in it. Creating and joining a room
 * are here too, since both end with the player's name.
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
import type { GameStateAction, Room } from '../types/index.mjs';

export type RoomDeps = Readonly<{
  api: RoomApi;
}>;

export type RoomStore = Readonly<{
  room: InitializedObservable<Room | undefined>;
  /** Every action of the room, oldest first, each time the database has more. */
  actionsFromDb: SynstateObservable<readonly GameStateAction[]>;
  /** Watches this room instead of the one before it, once started. */
  setRoomId: (roomId: string) => void;
  myName: InitializedObservable<string | undefined>;
  /**
   * Names this player, for a page opened as one: the name lives in memory
   * only, so a reload knows it only from the page's query.
   */
  setMyName: (myName: string) => void;
  createRoom: Readonly<{
    /** The room just created, with its id. */
    response: SynstateObservable<Room>;
    isWaitingResponse: InitializedObservable<boolean>;
    dispatch: (
      payload: Readonly<{
        username: string;
        password: string | undefined;
      }>,
    ) => Promise<Room>;
  }>;
  joinRoom: Readonly<{
    isWaitingResponse: InitializedObservable<boolean>;
    dispatch: (roomId: string, username: string) => Promise<void>;
  }>;
  /** Starts watching the room the id names; returns what stops it. */
  start: () => () => void;
}>;

export const createRoomStore = (deps: RoomDeps): RoomStore => {
  const [roomId, setRoomId] = createState<string | undefined>(undefined);

  const [room, setRoom] = createState<Room | undefined>(undefined);

  const actionsFromDb = source<readonly GameStateAction[]>();

  const [myName, setMyName] = createState<string | undefined>(undefined);

  const createRoom = (() => {
    const response = source<Room>();

    const [isWaitingResponse, { setState: setIsWaitingResponse }] =
      createBooleanState(false);

    const dispatch = async (
      payload: Readonly<{
        username: string;
        password: string | undefined;
      }>,
    ): Promise<Room> => {
      setIsWaitingResponse(true);

      const created = newRoom(payload.password, {
        name: payload.username,
        online: true,
      });

      const id = await deps.api.addRoom(created);

      const res: Room = { ...created, id } as const;

      setMyName(payload.username);

      setIsWaitingResponse(false);

      response.next(res);

      return res;
    };

    return { response, isWaitingResponse, dispatch } as const;
  })();

  const joinRoom = (() => {
    const [isWaitingResponse, { setState: setIsWaitingResponse }] =
      createBooleanState(false);

    const dispatch = async (id: string, username: string): Promise<void> => {
      setIsWaitingResponse(true);

      // A player who could not be added still goes on as that name.
      await Result.fromPromise(
        deps.api.addPlayer(id, { name: username, online: true }),
      );

      setMyName(username);

      setIsWaitingResponse(false);
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

      mut_watching.stopRoom = deps.api.watchRoom(id, setRoom);

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
    actionsFromDb,
    setRoomId,
    myName,
    setMyName,
    createRoom,
    joinRoom,
    start,
  };
};
