import { Json, Result } from 'ts-data-forge';
import { DatetimeRange } from 'ts-fortress-types';
import { type Brand } from 'ts-type-forge';

export type DatetimeRangeMapKey = Brand<string, 'DatetimeRangeMapKey'>;

export const datetimeRangeToMapKey = (
  datetimeRange: DatetimeRange,
): DatetimeRangeMapKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Result.unwrapThrow(Json.stringify(datetimeRange)) as DatetimeRangeMapKey;

export const datetimeRangeFromMapKey = (
  key: DatetimeRangeMapKey,
): DatetimeRange => DatetimeRange.fill(Result.unwrapThrow(Json.parse(key)));
