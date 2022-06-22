import {
  answerDeadlineRemainingDaysDefaultValue,
  notificationSettingsDefaultValue,
  timeRangeDefaultValue,
  ymdhmFromDate,
} from '@noshiro/event-schedule-app-shared';
import { defaultIconPoint } from './default-icon-point';
import { dict } from './dictionary';

export const yearMonthDateInitialValue: YearMonthDate = {
  year: IDate.getLocaleYear(IDate.today()),
  month: IDate.getLocaleMonth(IDate.today()),
  date: IDate.getLocaleDate(IDate.today()),
};

export const datetimeRangeInitialValue: DatetimeRange = {
  ymd: yearMonthDateInitialValue,
  timeRange: timeRangeDefaultValue,
};

export const datetimeRangeListInitialValue: NonEmptyArray<DatetimeRange> = [
  datetimeRangeInitialValue,
];

export const answerIconsInitialValue: AnswerIconSettings = {
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
} as const;

export const answerDeadlineInitialValue: Ymdhm = pipe(IDate.today())
  .chain(
    IDate.updateLocaleDate(
      (a) => (a + answerDeadlineRemainingDaysDefaultValue) as DateEnum
    )
  )
  .chain(IDate.setLocaleHours(23))
  .chain(IDate.setLocaleMinutes(59))
  .chain(IDate.toDate)
  .chain(ymdhmFromDate).value;

export const notificationSettingsInitialValue: NotificationSettings =
  IRecord.set(notificationSettingsDefaultValue, 'notifyOnAnswerChange', true);

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
  timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
  author: {
    id: null,
    name: '',
  },
  archivedBy: [],
};
