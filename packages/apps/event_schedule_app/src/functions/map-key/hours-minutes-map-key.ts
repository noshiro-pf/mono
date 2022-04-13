import type {
  HoursMinutes,
  PartialHoursMinutes,
} from '@noshiro/event-schedule-app-shared';
import { fillHoursMinutes } from '@noshiro/event-schedule-app-shared';
import type { Phantomic } from '@noshiro/ts-utils-additional';

export type HoursMinutesMapKey = Phantomic<string, 'HoursMinutesMapKey'>;

export const timeRangeToMapKey = (
  timeRange: HoursMinutes
): HoursMinutesMapKey =>
  Result.unwrapThrow(Json.stringify(timeRange)) as HoursMinutesMapKey;

export const timeRangeFromMapKey = (key: HoursMinutesMapKey): HoursMinutes =>
  fillHoursMinutes(
    Result.unwrapThrow(Json.parse(key)) as PartialHoursMinutes | undefined
  );
