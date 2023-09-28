import { fillDatetimeRange } from '@noshiro/event-schedule-app-shared';

export type DatetimeRangeMapKey = Brand<string, 'DatetimeRangeMapKey'>;

export const datetimeRangeToMapKey = (
  datetimeRange: DatetimeRange
): DatetimeRangeMapKey =>
  // eslint-disable-next-line no-restricted-syntax
  Result.unwrapThrow(Json.stringify(datetimeRange)) as DatetimeRangeMapKey;

export const datetimeRangeFromMapKey = (
  key: DatetimeRangeMapKey
): DatetimeRange => fillDatetimeRange(Result.unwrapThrow(Json.parse(key)));
