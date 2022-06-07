import type { PlayerIndex } from '../types';
import { db } from './database';
import { myName$ } from './my-name';

export const myPlayerIndex$: InitializedObservable<PlayerIndex | undefined> =
  combineLatestI([db.room$, myName$] as const).chain(
    mapI(([room, myName]) => {
      if (room === undefined || myName === undefined) return undefined;

      const index = room.players.findIndex((p) => p.name === myName);
      if (index === 0 || index === 1 || index === 2 || index === 3) {
        return index;
      }

      console.warn(
        `myName should be one of { 0, 1, 2, 3 }. result is "${index}". `
      );

      return undefined;
    })
  );
