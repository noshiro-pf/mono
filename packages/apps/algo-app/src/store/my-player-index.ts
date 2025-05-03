import { getShuffledPlayers } from '../functions';
import { type PlayerIndex } from '../types';
import { DB } from './database';
import { QueryParams } from './query-params';

export const myPlayerIndex$: InitializedObservable<PlayerIndex | undefined> =
  combine([DB.room$, DB.players$, QueryParams.myPlayerId$] as const).chain(
    map(([room, players, playerId]) => {
      if (room === undefined || Arr.isEmpty(players) || playerId === undefined)
        return undefined;

      const index: number = getShuffledPlayers(
        players,
        room.shuffleDef,
      ).findIndex((p) => p?.id === playerId);

      if (index === 0 || index === 1 || index === 2 || index === 3) {
        return index;
      }

      console.warn(
        `myPlayerIndex is expected to be one of { 0, 1, 2, 3 }. result is "${index}". `,
      );

      return undefined;
    }),
  );
