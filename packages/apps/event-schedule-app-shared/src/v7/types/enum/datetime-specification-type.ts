import * as t from '@noshiro/io-ts';
import { expectType } from '@noshiro/ts-utils';

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

expectType<
  typeof datetimeSpecificationOptions,
  Record<DatetimeSpecificationEnumType, DatetimeSpecificationEnumType>
>('<=');
