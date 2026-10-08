import { Json, Result } from 'ts-data-forge';
import { DatetimeRange } from 'ts-fortress-types';

export const datetimeRangeToMapKey = (datetimeRange: DatetimeRange): string =>
  Result.unwrapThrow(Json.stringify(datetimeRange)) ?? '';

export const datetimeRangeFromMapKey = (key: string): DatetimeRange =>
  DatetimeRange.fill(Result.unwrapThrow(Json.parse(key)));
