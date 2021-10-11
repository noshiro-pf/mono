import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
  EventSchedule,
  NotificationSettings,
  SymbolSettings,
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

export const defaultSymbolPoint = {
  good: 10,
  fair: 6,
  poor: 0,
  none: 0,
} as const;

export const initialAnswerSymbols: SymbolSettings = {
  good: {
    description: texts.symbolDescriptionDefault.circle,
    point: defaultSymbolPoint.good,
  },
  fair: {
    description: texts.symbolDescriptionDefault.triangleUp,
    point: defaultSymbolPoint.fair,
  },
  poor: {
    description: texts.symbolDescriptionDefault.cross,
    point: defaultSymbolPoint.poor,
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
  answerSymbols: initialAnswerSymbols,
  useNotification: false,
  notificationSettings: initialNotificationSettings,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
};
