import { api } from '../api';
import { isDevelopment } from '../env';
import { type GameStateAction, type PlayerWithId, type Room } from '../types';
import { router } from './router';

export namespace DB {
  const { state: room_$, setState: setRoom_ } = createState<Room | undefined>(
    undefined,
  );

  export const room$ = room_$;

  const { state: players_$, setState: setPlayers_ } = createState<
    readonly PlayerWithId[]
  >([]);

  export const players$ = players_$;

  const [actionsFromDb_$, setActionsFromDb_] =
    createEventEmitter<readonly GameStateAction[]>();

  export const { state: myName$, setState: setMyName } = createState<
    string | undefined
  >(undefined);

  export const actionsFromDb$ = actionsFromDb_$;

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
          setRoom_(room.value);
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
          setPlayers_(players.value);
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
          setActionsFromDb_(actions.value);
        } else {
          // TODO: show errors in the window
          console.error(actions.value);
        }
      });
    }
  });
}
