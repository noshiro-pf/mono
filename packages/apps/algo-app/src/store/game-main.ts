import { api } from '../api';
import { isDevelopment } from '../env';
import { newShuffleDef } from '../functions';
import { QueryParams } from './query-params';
import { router } from './router';
import { startAutoPlay } from './test-auto-play';

export namespace GameMainState {
  // shuffle seats
  export const shuffleSeatsWaitingState = createState<boolean>(false);

  const shuffleSeats = async (
    roomId: string,
  ): Promise<Result<void, unknown>> => {
    shuffleSeatsWaitingState.setState(true);
    const res = await api.updateShuffleDef(roomId, newShuffleDef());
    shuffleSeatsWaitingState.setState(false);
    return res;
  };

  export const onShuffleSeatsClick = (): void => {
    const roomId = mut_subscribedValues.roomId;
    if (roomId === undefined) return;

    shuffleSeats(roomId).catch(console.error);
  };

  // start game
  export const startGameWaitingState = createState<boolean>(false);

  const startGame = async (roomId: string): Promise<Result<void, unknown>> => {
    startGameWaitingState.setState(true);
    const res = await api.changeRoomState(roomId, 'playing');
    startGameWaitingState.setState(false);
    return res;
  };

  export const onStartGameClick = (): void => {
    const roomId = mut_subscribedValues.roomId;
    if (roomId === undefined) return;

    startGame(roomId).catch(console.error);
  };

  // exit
  const exitWaitingState = createState<boolean>(false);

  export const exit = async (
    roomId: string,
    playerId: string,
  ): Promise<Result<void, unknown>> => {
    exitWaitingState.setState(true);
    const res = await api.removePlayer({ roomId, playerId });
    exitWaitingState.setState(false);
    return res;
  };

  export const onExitClick = (): void => {
    const roomId = mut_subscribedValues.roomId;
    const playerId = mut_subscribedValues.playerId;
    if (roomId === undefined) return;
    if (playerId === undefined) return;

    exit(roomId, playerId).catch(console.error);
  };

  // copy link
  export const onClipboardButtonClick = (): void => {
    const url = mut_subscribedValues.url;

    // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    if (
      isNotUndefined(window.navigator.clipboard) &&
      window.isSecureContext &&
      isNotUndefined(url)
    ) {
      // TODO: use toast
      window.navigator.clipboard.writeText(url).catch(console.error);
    }
  };

  /* subscriptions */

  const mut_subscribedValues: {
    url: string | undefined;
    roomId: string | undefined;
    playerId: string | undefined;
  } = {
    url: undefined,
    roomId: undefined,
    playerId: undefined,
  };

  router.roomId$.subscribe((roomId) => {
    mut_subscribedValues.roomId = roomId;
  });

  router.playerId$.subscribe((playerId) => {
    mut_subscribedValues.playerId = playerId;
  });

  router.state.subscribe(({ pathname: url }) => {
    mut_subscribedValues.url = `${window.location.host}${url}`;
  });

  {
    let mut_isStarted = false;
    QueryParams.test$.subscribe((testMode) => {
      if (testMode && isDevelopment && !mut_isStarted) {
        mut_isStarted = true;
        startAutoPlay();
      }
    });
  }
}
