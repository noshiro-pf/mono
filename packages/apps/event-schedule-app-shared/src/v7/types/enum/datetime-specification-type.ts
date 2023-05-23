import * as t from '@noshiro/io-ts';

export const datetimeSpecificationTypeDef = t.enumType({
  values: [
    'noStartEndSpecified',
    'startSpecified',
    'endSpecified',
    'startAndEndSpecified',
  ] as const,
  defaultValue: 'noStartEndSpecified',
});

export type DatetimeSpecificationEnumType = t.TypeOf<
  typeof datetimeSpecificationTypeDef
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

export const isDatetimeSpecificationEnumType = datetimeSpecificationTypeDef.is;
