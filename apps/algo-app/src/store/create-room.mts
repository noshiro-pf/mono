import { source } from 'synstate';
import { createBooleanState } from 'synstate-preact-hooks';
import { type Room } from '../types/index.mjs';
import { db } from './database.mjs';
import { setMyName } from './my-name.mjs';

// `createEventEmitter` carries no payload now; `source` is the typed one.
const response$ = source<Room>();

const setResponse = (v: Room): void => {
  response$.next(v);
};

// The state creators return tuples now, not objects.
const [useIsWaitingResponse, { setState: setIsWaitingResponse }] =
  createBooleanState(false);

const dispatch = async (
  payload: Readonly<{
    username: string;
    password: string | undefined;
  }>,
): Promise<Room> => {
  setIsWaitingResponse(true);

  const res = await db.createRoom(payload);

  setMyName(payload.username);

  setIsWaitingResponse(false);

  setResponse(res);

  return res;
};

export const createRoom = {
  response$,
  useIsWaitingResponse,
  dispatch,
} as const;
