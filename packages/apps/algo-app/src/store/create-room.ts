import { type Room } from '../types';
import { db } from './database';
import { setMyName } from './my-name';

const [response$, setResponse] = createEventEmitter<Room>();

const { state$: isWaitingResponse$, setState: setIsWaitingResponse } =
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
  isWaitingResponse$,
  dispatch,
} as const;
