import * as t from '@noshiro/io-ts';

export const DayType = t.enumType(['holiday', 'normal', 'Saturday', 'Sunday'], {
  defaultValue: 'normal',
});

export type DayType = t.TypeOf<typeof DayType>;
