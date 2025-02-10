import { DatetimeRange } from '@noshiro/io-ts-types';
import { Json, Result } from '@noshiro/ts-utils';

export const datetimeRangeToMapKey = (datetimeRange: DatetimeRange): string =>
  Result.unwrapThrow(Json.stringify(datetimeRange));

export const datetimeRangeFromMapKey = (key: string): DatetimeRange =>
  DatetimeRange.fill(Result.unwrapThrow(Json.parse(key)));
