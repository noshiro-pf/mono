import * as t from 'ts-fortress';

const dayTypeDef = t.enumType(['holiday', 'normal', 'Saturday', 'Sunday'], {
  defaultValue: 'normal',
});

export type DayType = t.TypeOf<typeof dayTypeDef>;

export const isDayType = dayTypeDef.is;
