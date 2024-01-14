import {
  fillDatetimeRange,
  type DatetimeRange,
} from '@noshiro/event-schedule-app-shared';
import { Json, Result } from '@noshiro/ts-utils';

export const datetimeRangeToMapKey = (datetimeRange: DatetimeRange): string =>
  Result.unwrapThrow(Json.stringify(datetimeRange));

export const datetimeRangeFromMapKey = (key: string): DatetimeRange =>
  fillDatetimeRange(Result.unwrapThrow(Json.parse(key)));
