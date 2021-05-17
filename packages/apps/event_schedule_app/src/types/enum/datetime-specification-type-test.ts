import type { TypeExtends } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';
import type {
  DatetimeSpecificationEnumType,
  datetimeSpecificationOptions,
} from './datetime-specification-type';

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
