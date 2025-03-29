import * as t from '@noshiro/io-ts';
import { firestoreTimestampTypeDef } from './firestore-timestamp-type';

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

export const isPlayerWithId = playerWithIdTypeDef.is;
export const fillPlayerWithId = playerWithIdTypeDef.fill;

const playerWithIdArrayTypeDef = t.array(playerWithIdTypeDef);

export const validatePlayerWithIdArray = playerWithIdArrayTypeDef.validate;

export const keyForOrderingPlayerWithId = 'createdAt';

expectType<typeof keyForOrderingPlayerWithId, keyof PlayerWithId>('<=');
