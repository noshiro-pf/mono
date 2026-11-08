import { wallClockInOffset } from 'event-schedule-app-shared';
import type { Ymdhm } from 'ts-fortress-types';
import { isReminderHour } from './is-reminder-hour.mjs';
import { todayIsNDaysBeforeDeadline } from './today-is-n-day-before-deadline.mjs';

/**
 * Which of the `enabled` reminders (days before the deadline) the hourly run at
 * `nowMillis` sends for an event, all in the event's own zone.
 *
 * A reminder days before the deadline goes out at noon (`isReminderHour`). The
 * day-of one goes out at noon too when that run is before the deadline, and
 * otherwise in the run three hours before it, or the day's first run, provided
 * that run is still before it; a deadline no run of its day precedes gets none
 * (#3312).
 */
export const remindersDue = ({
  enabled,
  answerDeadline,
  timezoneOffsetMinutes,
  nowMillis,
}: Readonly<{
  enabled: readonly ReminderDays[];
  answerDeadline: Ymdhm;
  timezoneOffsetMinutes: number;
  nowMillis: number;
}>): readonly ReminderDays[] =>
  enabled.filter(
    (days) =>
      todayIsNDaysBeforeDeadline(
        days,
        answerDeadline,
        timezoneOffsetMinutes,
        nowMillis,
      ) &&
      (days === 0
        ? isDayOfReminderRun(answerDeadline, timezoneOffsetMinutes, nowMillis)
        : isReminderHour(nowMillis, timezoneOffsetMinutes)),
  );

export type ReminderDays = 0 | 1 | 3 | 7 | 14 | 28;

const minutesOfDay = ({
  hours,
  minutes,
}: Readonly<{ hours: number; minutes: number }>): number =>
  hours * 60 + minutes;

/**
 * Whether the run at `nowMillis`, on the deadline's date, is the one that sends
 * the day-of reminder. Every run of a day reads the same minutes in a zone, so
 * whether the noon run precedes the deadline can be told from any of them.
 */
const isDayOfReminderRun = (
  answerDeadline: Ymdhm,
  timezoneOffsetMinutes: number,
  nowMillis: number,
): boolean => {
  const now = wallClockInOffset(nowMillis, timezoneOffsetMinutes);

  const deadlineMinutes = minutesOfDay(answerDeadline);

  const noonRunMinutes = minutesOfDay({ hours: noon, minutes: now.minutes });

  const hour =
    noonRunMinutes < deadlineMinutes
      ? noon
      : Math.max(0, answerDeadline.hours - hoursBeforeDeadline);

  return now.hours === hour && minutesOfDay(now) < deadlineMinutes;
};

const noon = 12;

const hoursBeforeDeadline = 3;
