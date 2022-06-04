import { IDate } from '@noshiro/ts-utils';
import type {
  AnswerSymbol,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  NotificationSettings,
  PartialAnswerSymbol,
  PartialDatetimeRange,
  PartialNotificationSettings,
} from '../../../v1';
import {
  defaultNotificationSettings,
  fillAnswerSymbol,
  fillDatetimeRange,
  fillNotificationSettings,
} from '../../../v1';
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
  Readonly<{
    title: EventSchedule['title'];
    notes: EventSchedule['notes'];
    datetimeSpecification: EventSchedule['datetimeSpecification'];
    datetimeRangeList: readonly PartialDatetimeRange[];
    useAnswerDeadline: EventSchedule['useAnswerDeadline'];
    answerDeadline: PartialYmdhm;
    customizeSymbolSettings: EventSchedule['customizeSymbolSettings'];
    answerSymbolList: readonly PartialAnswerSymbol[];
    useNotification: EventSchedule['useNotification'];
    notificationSettings: PartialNotificationSettings;
    timezoneOffsetMinutes: EventSchedule['timezoneOffsetMinutes'];
  }>
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
  timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
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
