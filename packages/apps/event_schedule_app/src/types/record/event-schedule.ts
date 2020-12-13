import { IList, IRecord, IRecordType } from '../../utils/immutable';
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

type EventScheduleBaseType = {
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: IList<IDatetimeRange>;
  useAnswerDeadline: boolean;
  answerDeadline: IYmdHm;
  usePassword: boolean;
  password: string;
  answerSymbolList: IList<IAnswerSymbol>;
  useNotification: boolean;
  notificationSettings: INotificationSettings;
};

export type PartialEventSchedule = Partial<
  Readonly<{
    title: EventScheduleBaseType['title'];
    notes: EventScheduleBaseType['notes'];
    datetimeSpecification: EventScheduleBaseType['datetimeSpecification'];
    datetimeRangeList: readonly PartialDatetimeRange[];
    useAnswerDeadline: EventScheduleBaseType['useAnswerDeadline'];
    answerDeadline: PartialYmdHm;
    usePassword: EventScheduleBaseType['usePassword'];
    password: EventScheduleBaseType['password'];
    answerSymbolList: readonly PartialAnswerSymbol[];
    useNotification: EventScheduleBaseType['useNotification'];
    notificationSettings: PartialNotificationSettings;
  }>
>;

export type IEventSchedule = IRecordType<EventScheduleBaseType>;

const IEventScheduleRecordFactory = IRecord<EventScheduleBaseType>({
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: IList<IDatetimeRange>(),
  useAnswerDeadline: false,
  answerDeadline: createIYmdHm(),
  usePassword: false,
  password: '',
  answerSymbolList: IList<IAnswerSymbol>(),
  useNotification: false,
  notificationSettings: createINotificationSettings(),
});

export const createIEventSchedule: (
  a?: EventScheduleBaseType
) => IEventSchedule = IEventScheduleRecordFactory;

const d = IEventScheduleRecordFactory();
export const fillEventSchedule = (p: PartialEventSchedule): IEventSchedule =>
  createIEventSchedule({
    title: p.title ?? d.title,
    notes: p.notes ?? d.notes,
    datetimeSpecification: p.datetimeSpecification ?? d.datetimeSpecification,
    datetimeRangeList: IList(p.datetimeRangeList ?? d.datetimeRangeList).map(
      fillDatetimeRange
    ),
    useAnswerDeadline: p.useAnswerDeadline ?? d.useAnswerDeadline,
    answerDeadline: fillYmdHm(p.answerDeadline ?? d.answerDeadline),
    usePassword: p.usePassword ?? d.usePassword,
    password: p.password ?? d.password,
    answerSymbolList: IList(p.answerSymbolList ?? d.answerSymbolList).map(
      fillAnswerSymbol
    ),
    useNotification: p.useNotification ?? d.useNotification,
    notificationSettings: fillNotificationSettings(
      p.notificationSettings ?? d.notificationSettings
    ),
  });
