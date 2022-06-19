import * as t from '@noshiro/io-ts';

const dayTypeDef = t.enumType({
  values: ['holiday', 'normal', 'Saturday', 'Sunday'] as const,
  defaultValue: 'normal',
});

export type DayType = t.Typeof<typeof dayTypeDef>;

export const isDayType = dayTypeDef.is;
