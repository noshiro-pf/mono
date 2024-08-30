import { type PlayerIndex } from '../types';
import { db } from './database';
import { myName$ } from './my-name';

export const myPlayerIndex$: InitializedObservable<PlayerIndex | undefined> =
  combine([db.room$, myName$]).chain(
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
