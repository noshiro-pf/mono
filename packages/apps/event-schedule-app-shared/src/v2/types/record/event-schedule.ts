import { DateUtils } from '@noshiro/ts-utils';
import {
  defaultNotificationSettings,
  fillAnswerSymbol,
  fillDatetimeRange,
  fillNotificationSettings,
  type AnswerSymbol,
  type DatetimeRange,
  type DatetimeSpecificationEnumType,
  type NotificationSettings,
  type PartialAnswerSymbol,
  type PartialDatetimeRange,
  type PartialNotificationSettings,
} from '../../../v1';
import {
  defaultYmdhm,
  fillYmdhm,
  type PartialYmdhm,
  type Ymdhm,
} from './ymdhm';

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

export const defaultEventSchedule = {
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
} as const satisfies EventSchedule;

const d = defaultEventSchedule;
export const fillEventSchedule = (p?: PartialEventSchedule): EventSchedule => ({
  title: p?.title ?? d.title,
  notes: p?.notes ?? d.notes,
  datetimeSpecification: p?.datetimeSpecification ?? d.datetimeSpecification,
  datetimeRangeList: (p?.datetimeRangeList ?? d.datetimeRangeList).map(
    fillDatetimeRange,
  ),
  useAnswerDeadline: p?.useAnswerDeadline ?? d.useAnswerDeadline,
  answerDeadline: fillYmdhm(p?.answerDeadline ?? d.answerDeadline),
  customizeSymbolSettings:
    p?.customizeSymbolSettings ?? d.customizeSymbolSettings,
  answerSymbolList: (p?.answerSymbolList ?? d.answerSymbolList).map(
    fillAnswerSymbol,
  ),
  useNotification: p?.useNotification ?? d.useNotification,
  notificationSettings: fillNotificationSettings(
    p?.notificationSettings ?? d.notificationSettings,
  ),
  timezoneOffsetMinutes: p?.timezoneOffsetMinutes ?? d.timezoneOffsetMinutes,
});
