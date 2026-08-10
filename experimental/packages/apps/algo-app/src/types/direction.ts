import * as t from '@noshiro/io-ts';

export const NWESTypeDef = t.enumType(['N', 'W', 'E', 'S'], {
  defaultValue: 'S',
  typeName: 'NWES',
});

export type NWES = t.TypeOf<typeof NWESTypeDef>;
