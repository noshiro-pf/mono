import { createEventEmitter, createState } from '@noshiro/syncflow';
import type { Room } from '../types';
import { db } from './database';
import { setMyName } from './my-name';

export namespace createRoom {
  const [_response$, setResponse] = createEventEmitter<Room>();

  export const response$ = _response$;

  const [_isWaitingResponse$, setIsWaitingResponse] =
    createState<boolean>(false);

  export const isWaitingResponse$ = _isWaitingResponse$;

  export const dispatch = async (
    payload: Readonly<{
      username: string;
      password: string | undefined;
    }>
  ): Promise<Room> => {
    setIsWaitingResponse(true);

    const res = await db.createRoom(payload);

    setMyName(payload.username);

    setIsWaitingResponse(false);
    setResponse(res);

    return res;
  };
}
