import { db } from './database';
import { setMyName } from './my-name';

const {
  useCurrentValue: useIsWaitingResponse,
  setState: setIsWaitingResponse,
} = createBooleanState(false);

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
