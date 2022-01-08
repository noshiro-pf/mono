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
