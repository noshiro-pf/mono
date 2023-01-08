import { DateUtils } from '@noshiro/ts-utils';
import type { DatetimeSpecificationEnumType } from '../enum';
import type {
  AnswerSymbol,
  NotificationSettings,
  PartialAnswerSymbol,
  PartialNotificationSettings,
} from './base';
import {
  defaultNotificationSettings,
  fillAnswerSymbol,
  fillNotificationSettings,
} from './base';
import type { DatetimeRange, PartialDatetimeRange } from './datetime-range';
import { fillDatetimeRange } from './datetime-range';
import type { PartialYmdhm, Ymdhm } from './ymdhm';
import { defaultYmdhm, fillYmdhm } from './ymdhm';

export type EventSchedule = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRange[];
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  customizeSymbolSettings: boolean;
  answerSymbolList: readonly AnswerSymbol[];
  useNotification: boolean;
  notificationSettings: NotificationSettings;
  timezoneOffsetMinutes: number;
}>;

export type PartialEventSchedule = Partial<
  MergeIntersection<
    Pick<
      EventSchedule,
      | 'customizeSymbolSettings'
      | 'datetimeSpecification'
      | 'notes'
      | 'timezoneOffsetMinutes'
      | 'title'
      | 'useAnswerDeadline'
      | 'useNotification'
    > &
      Readonly<{
        datetimeRangeList: readonly PartialDatetimeRange[];
        answerDeadline: PartialYmdhm;
        answerSymbolList: readonly PartialAnswerSymbol[];
        notificationSettings: PartialNotificationSettings;
      }>
  >
>;

export const defaultEventSchedule: EventSchedule = {
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: [],
  useAnswerDeadline: false,
  answerDeadline: defaultYmdhm,
  customizeSymbolSettings: false,
  answerSymbolList: [],
  useNotification: false,
  notificationSettings: defaultNotificationSettings,
  timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
} as const;

const d = defaultEventSchedule;
export const fillEventSchedule = (p?: PartialEventSchedule): EventSchedule => ({
  title: p?.title ?? d.title,
  notes: p?.notes ?? d.notes,
  datetimeSpecification: p?.datetimeSpecification ?? d.datetimeSpecification,
  datetimeRangeList: (p?.datetimeRangeList ?? d.datetimeRangeList).map(
    fillDatetimeRange
  ),
  useAnswerDeadline: p?.useAnswerDeadline ?? d.useAnswerDeadline,
  answerDeadline: fillYmdhm(p?.answerDeadline ?? d.answerDeadline),
  customizeSymbolSettings:
    p?.customizeSymbolSettings ?? d.customizeSymbolSettings,
  answerSymbolList: (p?.answerSymbolList ?? d.answerSymbolList).map(
    fillAnswerSymbol
  ),
  useNotification: p?.useNotification ?? d.useNotification,
  notificationSettings: fillNotificationSettings(
    p?.notificationSettings ?? d.notificationSettings
  ),
  timezoneOffsetMinutes: p?.timezoneOffsetMinutes ?? d.timezoneOffsetMinutes,
});
