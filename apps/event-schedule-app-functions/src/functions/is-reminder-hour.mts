import { wallClockInOffset } from 'event-schedule-app-shared';

/**
 * Whether the hourly run at `nowMillis` is the one that reminds an event whose
 * zone has the offset `timezoneOffsetMinutes`: the run in the hour its clock
 * reads 12, so that each event is reminded once a day, at noon in its own zone.
 */
export const isReminderHour = (
  nowMillis: number,
  timezoneOffsetMinutes: number,
): boolean =>
  wallClockInOffset(nowMillis, timezoneOffsetMinutes).hours === reminderHour;

const reminderHour = 12;
