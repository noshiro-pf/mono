import {
  answerDeadlineRemainingDaysDefaultValue,
  notificationSettingsDefaultValue,
  ymdhmFromDate,
} from '@noshiro/event-schedule-app-shared';
import { defaultIconPoint } from './default-icon-point';
import { dict } from './dictionary';

export const initialDatetimeRangeList: readonly DatetimeRange[] = [];

export const initialAnswerIcons: AnswerIconSettings = {
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

export const initialAnswerDeadline: Ymdhm = pipe(IDate.today())
  .chain(
    IDate.updateLocaleDate(
      (a) => (a + answerDeadlineRemainingDaysDefaultValue) as DateEnum
    )
  )
  .chain(IDate.setLocaleHours(23))
  .chain(IDate.setLocaleMinutes(59))
  .chain(IDate.toDate)
  .chain(ymdhmFromDate).value;

export const initialNotificationSettings: NotificationSettings = IRecord.set(
  notificationSettingsDefaultValue,
  'notifyOnAnswerChange',
  true
);

export const initialDatetimeSpecification: DatetimeSpecificationEnumType =
  'startSpecified';

export const initialEventSchedule: EventSchedule = {
  title: '',
  notes: '',
  datetimeSpecification: initialDatetimeSpecification,
  datetimeRangeList: initialDatetimeRangeList,
  answerDeadline: 'none',
  answerIcons: initialAnswerIcons,
  notificationSettings: 'none',
  timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
  author: {
    id: null,
    name: '',
  },
};
