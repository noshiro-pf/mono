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
} as const satisfies Record<
  DatetimeSpecificationEnumType,
  DatetimeSpecificationEnumType
>;

export const isDatetimeSpecificationEnumType = (
  a: unknown,
): a is DatetimeSpecificationEnumType =>
  a === 'noStartEndSpecified' ||
  a === 'startSpecified' ||
  a === 'endSpecified' ||
  a === 'startAndEndSpecified';
