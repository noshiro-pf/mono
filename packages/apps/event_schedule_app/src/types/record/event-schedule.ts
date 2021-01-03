import { IList, IRecord } from '../../utils/immutable';
import { DatetimeSpecificationEnumType } from '../enum/datetime-specification-type';
import {
  fillAnswerSymbol,
  IAnswerSymbol,
  PartialAnswerSymbol,
} from './base/answer-symbol';
import {
  createINotificationSettings,
  fillNotificationSettings,
  INotificationSettings,
  PartialNotificationSettings,
} from './base/notification-settings';
import {
  fillDatetimeRange,
  IDatetimeRange,
  PartialDatetimeRange,
} from './datetime-range';
import { createIYmdHm, fillYmdHm, IYmdHm, PartialYmdHm } from './ymd-hm';

export type EventScheduleBaseType = {
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: IList<IDatetimeRange>;
  useAnswerDeadline: boolean;
  answerDeadline: IYmdHm | undefined;
  customizeSymbolSettings: boolean;
  answerSymbolList: IList<IAnswerSymbol>;
  useNotification: boolean;
  notificationSettings: INotificationSettings;
  timezoneOffsetMinutes: number;
};

export type PartialEventSchedule = Partial<
  Readonly<{
    title: EventScheduleBaseType['title'];
    notes: EventScheduleBaseType['notes'];
    datetimeSpecification: EventScheduleBaseType['datetimeSpecification'];
    datetimeRangeList: readonly PartialDatetimeRange[];
    useAnswerDeadline: EventScheduleBaseType['useAnswerDeadline'];
    answerDeadline: PartialYmdHm;
    customizeSymbolSettings: EventScheduleBaseType['customizeSymbolSettings'];
    answerSymbolList: readonly PartialAnswerSymbol[];
    useNotification: EventScheduleBaseType['useNotification'];
    notificationSettings: PartialNotificationSettings;
    timezoneOffsetMinutes: EventScheduleBaseType['timezoneOffsetMinutes'];
  }>
>;

export type IEventSchedule = IRecord<EventScheduleBaseType> &
  Readonly<EventScheduleBaseType>;

const IEventScheduleRecordFactory = IRecord<EventScheduleBaseType>({
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: IList<IDatetimeRange>(),
  useAnswerDeadline: false,
  answerDeadline: createIYmdHm(),
  customizeSymbolSettings: false,
  answerSymbolList: IList<IAnswerSymbol>(),
  useNotification: false,
  notificationSettings: createINotificationSettings(),
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
});

export const createIEventSchedule: (
  a?: EventScheduleBaseType
) => IEventSchedule = IEventScheduleRecordFactory;

const d = IEventScheduleRecordFactory();
export const fillEventSchedule = (p?: PartialEventSchedule): IEventSchedule =>
  createIEventSchedule({
    title: p?.title ?? d.title,
    notes: p?.notes ?? d.notes,
    datetimeSpecification: p?.datetimeSpecification ?? d.datetimeSpecification,
    datetimeRangeList: IList(p?.datetimeRangeList ?? d.datetimeRangeList).map(
      fillDatetimeRange
    ),
    useAnswerDeadline: p?.useAnswerDeadline ?? d.useAnswerDeadline,
    answerDeadline: fillYmdHm(p?.answerDeadline ?? d.answerDeadline),
    customizeSymbolSettings:
      p?.customizeSymbolSettings ?? d.customizeSymbolSettings,
    answerSymbolList: IList(p?.answerSymbolList ?? d.answerSymbolList).map(
      fillAnswerSymbol
    ),
    useNotification: p?.useNotification ?? d.useNotification,
    notificationSettings: fillNotificationSettings(
      p?.notificationSettings ?? d.notificationSettings
    ),
    timezoneOffsetMinutes: p?.timezoneOffsetMinutes ?? d.timezoneOffsetMinutes,
  });
