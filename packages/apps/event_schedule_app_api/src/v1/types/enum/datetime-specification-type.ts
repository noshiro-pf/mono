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

import type { TypeExtends } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';

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
