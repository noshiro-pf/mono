import {
  defaultAnswerDeadlineRemainingDays,
  NotificationSettings,
  UserName,
} from 'event-schedule-app-shared';
import { Arr, pipe } from 'ts-data-forge';
import { DateUtils, TimeRange, YmdhmFromDate } from 'ts-fortress-types';
import type { NonEmptyArray } from 'ts-type-forge';
import { endOfDaysLater, todayYearMonthDate } from '../utils/index.mjs';
import { defaultIconPoint } from './default-icon-point.mjs';
import { dict } from './dictionary/index.mjs';

/**
 * Today's date, the one a new date row takes. A function, read when the row is
 * added, so that a tab left open past midnight does not offer yesterday.
 */
export const yearMonthDateInitialValue = (): YearMonthDate =>
  todayYearMonthDate();

/**
 * The form's first date row. Like the rest of the empty form below, it is the
 * day the page loaded.
 */
export const datetimeRangeInitialValue: DatetimeRange = {
  ymd: yearMonthDateInitialValue(),
  timeRange: TimeRange.defaultValue,
} as const;

export const datetimeRangeListInitialValue: NonEmptyArray<DatetimeRange> =
  Arr.asNonEmptyArray([datetimeRangeInitialValue]);

export const answerIconsInitialValue = {
  good: {
    description: dict.iconDescriptionDefault.circle,
    point: defaultIconPoint.good,
  },
  fair: {
    description: dict.iconDescriptionDefault.triangleUp,
    point: defaultIconPoint.fair,
  },
  poor: {
    description: dict.iconDescriptionDefault.cross,
    point: defaultIconPoint.poor,
  },
} as const satisfies AnswerIconSettings;

/**
 * The deadline proposed when the section is turned on: some days from today, at
 * 23:59. A function, read when the switch is turned on.
 */
export const answerDeadlineInitialValue = (): Ymdhm =>
  YmdhmFromDate(
    endOfDaysLater(DateUtils.today(), defaultAnswerDeadlineRemainingDays),
  );

export const notificationSettingsInitialValue: NotificationSettings = pipe(
  NotificationSettings.defaultValue,
).map((o) => ({ ...o, notifyOnAnswerChange: true })).value;

export const datetimeSpecificationInitialValue: DatetimeSpecificationEnumType =
  'startSpecified';

export const eventScheduleInitialValue: EventSchedule = {
  title: '',
  notes: '',
  datetimeSpecification: datetimeSpecificationInitialValue,
  datetimeRangeList: datetimeRangeListInitialValue,
  answerDeadline: 'none',
  answerIcons: answerIconsInitialValue,
  notificationSettings: 'none',
  timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
  author: { id: null, name: UserName.cast('') },
  archivedBy: [],
} as const;
