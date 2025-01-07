import { DatetimeRange } from '@noshiro/io-ts-types';

export type DatetimeRangeMapKey = Brand<string, 'DatetimeRangeMapKey'>;

export const datetimeRangeToMapKey = (
  datetimeRange: DatetimeRange,
): DatetimeRangeMapKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Result.unwrapThrow(Json.stringify(datetimeRange)) as DatetimeRangeMapKey;

export const datetimeRangeFromMapKey = (
  key: DatetimeRangeMapKey,
): DatetimeRange => DatetimeRange.fill(Result.unwrapThrow(Json.parse(key)));
