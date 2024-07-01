import { api } from '../api';
import { isDevelopment } from '../env';
import { type GameStateAction, type PlayerWithId, type Room } from '../types';
import { router } from './router';

export namespace DB {
  const { state$: _room$, setState: _setRoom } = createState<Room | undefined>(
    undefined,
  );

  export const room$ = _room$;

  const { state$: _players$, setState: _setPlayers } = createState<
    readonly PlayerWithId[]
  >([]);

  export const players$ = _players$;

  const [_actionsFromDb$, _setActionsFromDb] =
    createEventEmitter<readonly GameStateAction[]>();

  export const { state$: myName$, setState: setMyName } = createState<
    string | undefined
  >(undefined);

  export const actionsFromDb$ = _actionsFromDb$;

  const mut_unsubscribe: {
    room: () => void;
    actions: () => void;
    players: () => void;
  } = {
    room: noop,
    actions: noop,
    players: noop,
  };

  router.roomId$.subscribe((roomId) => {
    if (roomId === undefined) return;

    mut_unsubscribe.room();
    mut_unsubscribe.actions();
    mut_unsubscribe.players();

    {
      const { roomStream$, unsubscribeRoomSnapshot } =
        api.getRoomStream(roomId);
      mut_unsubscribe.room = unsubscribeRoomSnapshot;

      roomStream$.subscribe((room) => {
        if (Result.isOk(room)) {
          if (isDevelopment) {
            console.log({ room: room.value });
          }
          _setRoom(room.value);
        } else {
          // TODO: show errors in the window
          console.error(room.value);
        }
      });
    }
    {
      const { playersStream$, unsubscribePlayersSnapshot } =
        api.getPlayersStream(roomId);

      mut_unsubscribe.players = unsubscribePlayersSnapshot;

      playersStream$.subscribe((players) => {
        if (Result.isOk(players)) {
          if (isDevelopment) {
            console.log({ players: players.value });
          }
          _setPlayers(players.value);
        } else {
          // TODO: show errors in the window
          console.error(players.value);
        }
      });
    }
    {
      const { gameActionsStream$, unsubscribeActionsSnapshot } =
        api.getActionsStream(roomId);

      mut_unsubscribe.actions = unsubscribeActionsSnapshot;

      gameActionsStream$.subscribe((actions) => {
        if (Result.isOk(actions)) {
          if (isDevelopment) {
            console.log({ actions: actions.value });
          }
          _setActionsFromDb(actions.value);
        } else {
          // TODO: show errors in the window
          console.error(actions.value);
        }
      });
    }
  });
}
