import { assertType } from '@noshiro/ts-utils';

/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
export type DatetimeSpecificationEnumType =
  | 'noStartEndSpecified'
  | 'startSpecified'
  | 'endSpecified'
  | 'startAndEndSpecified';

export const datetimeSpecificationOptions = {
  noStartEndSpecified: 'noStartEndSpecified',
  startSpecified: 'startSpecified',
  endSpecified: 'endSpecified',
  startAndEndSpecified: 'startAndEndSpecified',
} as const;

export const isDatetimeSpecificationEnumType = (
  a: unknown
): a is DatetimeSpecificationEnumType =>
  a === 'noStartEndSpecified' ||
  a === 'startSpecified' ||
  a === 'endSpecified' ||
  a === 'startAndEndSpecified';

assertType<
  TypeExtends<
    typeof datetimeSpecificationOptions.noStartEndSpecified,
    DatetimeSpecificationEnumType
  >
>();

assertType<
  TypeExtends<
    typeof datetimeSpecificationOptions.startSpecified,
    DatetimeSpecificationEnumType
  >
>();

assertType<
  TypeExtends<
    typeof datetimeSpecificationOptions.endSpecified,
    DatetimeSpecificationEnumType
  >
>();

assertType<
  TypeExtends<
    typeof datetimeSpecificationOptions.startAndEndSpecified,
    DatetimeSpecificationEnumType
  >
>();
