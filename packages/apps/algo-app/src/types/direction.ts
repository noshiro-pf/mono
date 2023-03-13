import * as t from '@noshiro/io-ts';

const NWESTypeDef = t.enumType({
  values: ['N', 'W', 'E', 'S'] as const,
  defaultValue: 'S',
  typeName: 'NWES',
});

export type NWES = t.TypeOf<typeof NWESTypeDef>;
