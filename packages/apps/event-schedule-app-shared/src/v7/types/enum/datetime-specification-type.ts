import * as t from '@noshiro/io-ts';
import { assertType } from '@noshiro/ts-utils';

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
} as const;

export const isDatetimeSpecificationEnumType = datetimeSpecificationTypeDef.is;

assertType<
  TypeExtends<
    typeof datetimeSpecificationOptions,
    ReadonlyRecord<DatetimeSpecificationEnumType, DatetimeSpecificationEnumType>
  >
>();
