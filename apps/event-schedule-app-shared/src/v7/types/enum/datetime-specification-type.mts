import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';

export const datetimeSpecificationTypeDef = t.enumType(
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
  typeof datetimeSpecificationTypeDef
>;

export const datetimeSpecificationOptions = {
  noStartEndSpecified: 'noStartEndSpecified',
  startSpecified: 'startSpecified',
  endSpecified: 'endSpecified',
  startAndEndSpecified: 'startAndEndSpecified',
} as const satisfies ReadonlyRecord<
  DatetimeSpecificationEnumType,
  DatetimeSpecificationEnumType
>;

export const isDatetimeSpecificationEnumType = datetimeSpecificationTypeDef.is;
