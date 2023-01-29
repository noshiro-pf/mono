import { expectType } from '@noshiro/ts-utils';

/* eslint-disable @typescript-eslint/sort-type-constituents */
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

expectType<
  typeof datetimeSpecificationOptions.noStartEndSpecified,
  DatetimeSpecificationEnumType
>('<=');

expectType<
  typeof datetimeSpecificationOptions.startSpecified,
  DatetimeSpecificationEnumType
>('<=');

expectType<
  typeof datetimeSpecificationOptions.endSpecified,
  DatetimeSpecificationEnumType
>('<=');

expectType<
  typeof datetimeSpecificationOptions.startAndEndSpecified,
  DatetimeSpecificationEnumType
>('<=');
