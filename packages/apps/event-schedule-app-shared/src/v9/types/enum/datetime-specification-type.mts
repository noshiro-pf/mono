import * as t from '@noshiro/io-ts';

export const DatetimeSpecificationEnumType = t.enumType(
  [
    'noStartEndSpecified',
    'startSpecified',
    'endSpecified',
    'startAndEndSpecified',
  ],
  {
    defaultValue: 'noStartEndSpecified',
  },
);

export type DatetimeSpecificationEnumType = t.TypeOf<
  typeof DatetimeSpecificationEnumType
>;

export const datetimeSpecificationOptions = {
  noStartEndSpecified: 'noStartEndSpecified',
  startSpecified: 'startSpecified',
  endSpecified: 'endSpecified',
  startAndEndSpecified: 'startAndEndSpecified',
} as const satisfies Record<
  DatetimeSpecificationEnumType,
  DatetimeSpecificationEnumType
>;
