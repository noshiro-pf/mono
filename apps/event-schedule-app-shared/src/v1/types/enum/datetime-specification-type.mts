import { type ReadonlyRecord } from 'ts-type-forge';

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
} as const satisfies ReadonlyRecord<
  DatetimeSpecificationEnumType,
  DatetimeSpecificationEnumType
>;
