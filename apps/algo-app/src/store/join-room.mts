import { createBooleanState } from 'synstate-preact-hooks';
import { db } from './database.mjs';
import { setMyName } from './my-name.mjs';

// The state creators return tuples now, not objects.
const [useIsWaitingResponse, { setState: setIsWaitingResponse }] =
  createBooleanState(false);

const dispatch = async (roomId: string, username: string): Promise<void> => {
  setIsWaitingResponse(true);

  await db.addPlayer(roomId, username);

  setMyName(username);

  setIsWaitingResponse(false);
};

export const joinRoom = {
  useIsWaitingResponse,
  dispatch,
} as const;
