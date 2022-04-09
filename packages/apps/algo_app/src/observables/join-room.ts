import { db } from './database';
import { setMyName } from './my-name';

export namespace joinRoom {
  const { state$: _isWaitingResponse$, setState: setIsWaitingResponse } =
    createState<boolean>(false);

  export const isWaitingResponse$ = _isWaitingResponse$;

  export const dispatch = async (
    roomId: string,
    username: string
  ): Promise<void> => {
    setIsWaitingResponse(true);

    await db.addPlayer(roomId, username);
    setMyName(username);

    setIsWaitingResponse(false);
  };
}
