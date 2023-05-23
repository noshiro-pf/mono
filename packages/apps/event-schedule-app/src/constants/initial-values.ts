import {
  answerDeadlineRemainingDaysDefaultValue,
  notificationSettingsDefaultValue,
  timeRangeDefaultValue,
  ymdhmFromDate,
} from '@noshiro/event-schedule-app-shared';
import { defaultIconPoint } from './default-icon-point';
import { dict } from './dictionary';

export const yearMonthDateInitialValue: YearMonthDate = {
  year: DateUtils.getLocaleYear(DateUtils.today()),
  month: DateUtils.getLocaleMonth(DateUtils.today()),
  date: DateUtils.getLocaleDate(DateUtils.today()),
};

export const datetimeRangeInitialValue: DatetimeRange = {
  ymd: yearMonthDateInitialValue,
  timeRange: timeRangeDefaultValue,
};

export const datetimeRangeListInitialValue: NonEmptyArray<DatetimeRange> = [
  datetimeRangeInitialValue,
];

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
  .chain(
    DateUtils.updateLocaleDate(
      (a) => (a + answerDeadlineRemainingDaysDefaultValue) as DateEnum
    )
  )
  .chain(DateUtils.setLocaleHours(23))
  .chain(DateUtils.setLocaleMinutes(59))
  .chain(DateUtils.toDate)
  .chain(ymdhmFromDate).value;

export const notificationSettingsInitialValue: NotificationSettings = Obj.set(
  notificationSettingsDefaultValue,
  'notifyOnAnswerChange',
  true
);

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
  author: {
    id: null,
    name: '',
  },
  archivedBy: [],
};
