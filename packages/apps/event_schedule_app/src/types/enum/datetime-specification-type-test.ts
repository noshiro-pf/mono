import { assertType, TypeExtends } from '@noshiro/ts-utils';
import {
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
