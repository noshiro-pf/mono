import * as t from 'ts-fortress';
import { firestoreTimestampTypeDef } from './firestore-timestamp-type.mjs';

/**
 * A player of a room, a document of `rooms/{id}/players`. `createdAt` is
 * `serverTimestamp()` when written and orders the players: the first is the one
 * who created the room.
 */
export const playerTypeDef = t.record(
  {
    name: t.string(''),
    online: t.boolean(false),
    createdAt: firestoreTimestampTypeDef,
  },
  {
    typeName: 'Player',
  },
);

export type Player = t.TypeOf<typeof playerTypeDef>;

export const isPlayer = playerTypeDef.is;

export const fillPlayer = playerTypeDef.fill;

/** A player with the id of its document, which the page's URL carries. */
export const playerWithIdTypeDef = t.record(
  {
    id: t.string(''),
    name: t.string(''),
    online: t.boolean(false),
    createdAt: firestoreTimestampTypeDef,
  },
  {
    typeName: 'PlayerWithId',
  },
);

export type PlayerWithId = t.TypeOf<typeof playerWithIdTypeDef>;

export const assertIsPlayerWithId: (a: unknown) => asserts a is PlayerWithId =
  playerWithIdTypeDef.assertIs;

/** The field the players are ordered by. */
export const keyForOrderingPlayers = 'createdAt' satisfies keyof Player;
