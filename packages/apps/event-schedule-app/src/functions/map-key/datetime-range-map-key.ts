import { fillDatetimeRange } from '@noshiro/event-schedule-app-shared';

export type DatetimeRangeMapKey = Phantomic<string, 'DatetimeRangeMapKey'>;

export const datetimeRangeToMapKey = (
  datetimeRange: DatetimeRange
): DatetimeRangeMapKey =>
  Result.unwrapThrow(Json.stringify(datetimeRange)) as DatetimeRangeMapKey;

export const datetimeRangeFromMapKey = (
  key: DatetimeRangeMapKey
): DatetimeRange => fillDatetimeRange(Result.unwrapThrow(Json.parse(key)));
