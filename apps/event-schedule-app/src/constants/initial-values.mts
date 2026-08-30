import {
  defaultAnswerDeadlineRemainingDays,
  NotificationSettings,
  UserName,
} from 'event-schedule-app-shared';
import { Arr, pipe } from 'ts-data-forge';
import { DateUtils, TimeRange, YmdhmFromDate } from 'ts-fortress-types';
import { type DateEnum, type NonEmptyArray } from 'ts-type-forge';
import { defaultIconPoint } from './default-icon-point.mjs';
import { dict } from './dictionary/index.mjs';

export const yearMonthDateInitialValue: YearMonthDate = {
  year: DateUtils.getLocaleYear(DateUtils.today()),
  month: DateUtils.getLocaleMonth(DateUtils.today()),
  date: DateUtils.getLocaleDate(DateUtils.today()),
} as const;

export const datetimeRangeInitialValue: DatetimeRange = {
  ymd: yearMonthDateInitialValue,
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

export const answerDeadlineInitialValue: Ymdhm = pipe(DateUtils.today())
  .map(
    DateUtils.updateLocaleDate(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (a) => (a + defaultAnswerDeadlineRemainingDays) as DateEnum,
    ),
  )
  .map(DateUtils.setLocaleHours(23))
  .map(DateUtils.setLocaleMinutes(59))
  .map(DateUtils.toDate)
  .map(YmdhmFromDate).value;

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
