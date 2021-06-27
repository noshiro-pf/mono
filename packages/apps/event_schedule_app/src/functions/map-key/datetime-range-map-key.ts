import type { DatetimeRange } from '@noshiro/event-schedule-app-api';
import { fillDatetimeRange } from '@noshiro/event-schedule-app-api';
import type { Phantomic } from '@noshiro/ts-utils';

export type DatetimeRangeMapKey = Phantomic<string, 'DatetimeRangeMapKey'>;

export const datetimeRangeToMapKey = (
  datetimeRange: DatetimeRange
): DatetimeRangeMapKey => JSON.stringify(datetimeRange) as DatetimeRangeMapKey;

export const datetimeRangeFromMapKey = (
  key: DatetimeRangeMapKey
): DatetimeRange => fillDatetimeRange(JSON.parse(key));
