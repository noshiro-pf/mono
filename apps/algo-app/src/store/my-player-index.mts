import { combine, map, type InitializedObservable } from 'synstate';
import { type PlayerIndex } from '../types/index.mjs';
import { db } from './database.mjs';
import { myName$ } from './my-name.mjs';

export const myPlayerIndex$: InitializedObservable<PlayerIndex | undefined> =
  combine([db.room$, myName$]).pipe(
    map(([room, myName]) => {
      if (room === undefined || myName === undefined) return undefined;

      const index: number = room.players.findIndex((p) => p.name === myName);

      if (index === 0 || index === 1 || index === 2 || index === 3) {
        return index;
      }

      console.warn(
        `myName should be one of { 0, 1, 2, 3 }. result is "${index}". `,
      );

      return undefined;
    }),
  );
