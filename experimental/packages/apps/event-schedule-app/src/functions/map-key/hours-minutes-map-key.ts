import { HoursMinutes } from '@noshiro/io-ts-types';

export type HoursMinutesMapKey = Brand<string, 'HoursMinutesMapKey'>;

export const timeRangeToMapKey = (
  timeRange: HoursMinutes,
): HoursMinutesMapKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Result.unwrapThrow(Json.stringify(timeRange)) as HoursMinutesMapKey;

export const timeRangeFromMapKey = (key: HoursMinutesMapKey): HoursMinutes =>
  HoursMinutes.fill(Result.unwrapThrow(Json.parse(key)));
