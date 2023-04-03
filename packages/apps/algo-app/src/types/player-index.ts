import * as t from '@noshiro/io-ts';

export const playerIndexTypeDef = t.uintRange({
  start: 0,
  end: 4,
  defaultValue: 0,
  typeName: 'PlayerIndex',
});

export type PlayerIndex = t.TypeOf<typeof playerIndexTypeDef>;

export const fillPlayerIndex = playerIndexTypeDef.fill;
