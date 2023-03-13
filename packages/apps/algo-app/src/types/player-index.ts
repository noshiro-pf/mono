import * as t from '@noshiro/io-ts';

export const playerIndexTypeDef = t.uintRange({
  min: 0,
  max: 3,
  defaultValue: 0,
  typeName: 'PlayerIndex',
});

export type PlayerIndex = t.TypeOf<typeof playerIndexTypeDef>;

export const fillPlayerIndex = playerIndexTypeDef.fill;
