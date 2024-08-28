import * as t from '@noshiro/io-ts';

export const playerTypeDef = t.record(
  {
    name: t.string(''),
    online: t.boolean(false),
  },
  {
    typeName: 'Player',
  },
);

export type Player = t.TypeOf<typeof playerTypeDef>;

export const isPlayer = playerTypeDef.is;

export const fillPlayer = playerTypeDef.fill;
