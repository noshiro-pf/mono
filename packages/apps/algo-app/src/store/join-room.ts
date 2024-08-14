import { db } from './database';
import { setMyName } from './my-name';

const { state: isWaitingResponse$, setState: setIsWaitingResponse } =
  createBooleanState(false);

const dispatch = async (roomId: string, username: string): Promise<void> => {
  setIsWaitingResponse(true);

  await db.addPlayer(roomId, username);
  setMyName(username);

  setIsWaitingResponse(false);
};

export const joinRoom = {
  isWaitingResponse$,
  dispatch,
} as const;
