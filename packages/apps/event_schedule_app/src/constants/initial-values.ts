import type {
  AnswerSymbol,
  DatetimeRange,
  DatetimeSpecificationEnumType,
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

export const initialAnswerSymbolList: readonly AnswerSymbol[] = [
  {
    iconId: 'handmade-circle',
    description: texts.symbolDescriptionDefault.circle,
    point: 10,
  },
  {
    iconId: 'handmade-triangle',
    description: texts.symbolDescriptionDefault.triangleUp,
    point: 6,
  },
  {
    iconId: 'handmade-cross',
    description: texts.symbolDescriptionDefault.cross,
    point: 0,
  },
] as const;

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
