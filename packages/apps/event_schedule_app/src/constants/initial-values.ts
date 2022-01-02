import type {
  AnswerIconSettings,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  EventSchedule,
  NotificationSettings,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import {
  defaultAnswerDeadlineRemainingDays,
  defaultNotificationSettings,
  ymdhmFromDate,
} from '@noshiro/event-schedule-app-shared';
import type { DateEnum } from '@noshiro/ts-utils';
import {
  getDate,
  IRecord,
  pipe,
  setDate,
  setHours,
  setMinutes,
  today,
} from '@noshiro/ts-utils';
import { texts } from './texts';

export const initialDatetimeRangeList: readonly DatetimeRange[] = [];

export const defaultIconPoint = {
  good: 10,
  fair: 6,
  poor: 0,
  none: 0,
} as const;

export const initialAnswerIcons: AnswerIconSettings = {
  good: {
    description: texts.iconDescriptionDefault.circle,
    point: defaultIconPoint.good,
  },
  fair: {
    description: texts.iconDescriptionDefault.triangleUp,
    point: defaultIconPoint.fair,
  },
  poor: {
    description: texts.iconDescriptionDefault.cross,
    point: defaultIconPoint.poor,
  },
} as const;

export const initialAnswerDeadline: Ymdhm = pipe(today())
  .chain((d) =>
    setDate(d, (getDate(d) + defaultAnswerDeadlineRemainingDays) as DateEnum)
  )
  .chain((d) => setHours(d, 23))
  .chain((d) => setMinutes(d, 59))
  .chain(ymdhmFromDate).value;

export const initialNotificationSettings: NotificationSettings = IRecord.set(
  defaultNotificationSettings,
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
  useAnswerDeadline: false,
  answerDeadline: initialAnswerDeadline,
  answerIcons: initialAnswerIcons,
  useNotification: false,
  notificationSettings: initialNotificationSettings,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
};
