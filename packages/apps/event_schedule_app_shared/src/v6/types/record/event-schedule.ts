import {
  IDate,
  IList,
  IRecord,
  isNumber,
  isRecord,
  isString,
} from '@noshiro/ts-utils';
import type { DatetimeSpecificationEnumType } from '../enum';
import { isDatetimeSpecificationEnumType } from '../enum';
import type { AnswerIconSettings } from './answer-icon-settings';
import {
  fillAnswerIconSettings,
  isAnswerIconSettings,
} from './answer-icon-settings';
import type { NotificationSettings, User, Ymdhm } from './base';
import {
  answerIconSettingDefaultValue,
  fillNotificationSettings,
  fillUser,
  fillYmdhm,
  isNotificationSettings,
  isUser,
  isYmdhm,
  userDefaultValue,
} from './base';
import type { DatetimeRange } from './datetime-range';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
} from './datetime-range';

export type EventSchedule = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: NonEmptyArray<DatetimeRange>;
  answerDeadline: Ymdhm | 'none';
  answerIcons: AnswerIconSettings;
  notificationSettings: NotificationSettings | 'none';
  timezoneOffsetMinutes: number;
  author: User;
  archivedBy: readonly User[];
}>;

export const eventScheduleDefaultValue: EventSchedule = {
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: [datetimeRangeDefaultValue],
  answerDeadline: 'none',
  answerIcons: {
    good: answerIconSettingDefaultValue,
    fair: answerIconSettingDefaultValue,
    poor: answerIconSettingDefaultValue,
  },
  notificationSettings: 'none',
  timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
  author: userDefaultValue,
  archivedBy: [],
} as const;

const isAnswerDeadline = (e: unknown): e is Ymdhm | 'none' =>
  e === 'none' || isYmdhm(e);

const isNotificationSettingsWithNone = (
  e: unknown
): e is NotificationSettings | 'none' =>
  e === 'none' || isNotificationSettings(e);

const isDatetimeRangeList = (e: unknown): e is DatetimeRange[] =>
  IList.isArray(e) &&
  IList.isArrayOfLength1OrMore(e) &&
  e.every(isDatetimeRange);

const isUserList = (e: unknown): e is User[] =>
  IList.isArray(e) && e.every(isUser);

// memo: isEventScheduleImpl{1,2} is used to avoid a ts error
// "Expression produces a union type that is too complex to represent.".
const isEventScheduleImpl1 = (
  a: ReadonlyRecord<string, unknown>
): a is Pick<
  EventSchedule,
  | 'answerDeadline'
  | 'datetimeRangeList'
  | 'datetimeSpecification'
  | 'notes'
  | 'title'
> =>
  IRecord.hasKeyValue(a, 'title', isString) &&
  IRecord.hasKeyValue(a, 'notes', isString) &&
  IRecord.hasKeyValue(
    a,
    'datetimeSpecification',
    isDatetimeSpecificationEnumType
  ) &&
  IRecord.hasKeyValue(a, 'datetimeRangeList', isDatetimeRangeList) &&
  IRecord.hasKeyValue(a, 'answerDeadline', isAnswerDeadline);

const isEventScheduleImpl2 = (
  a: ReadonlyRecord<string, unknown>
): a is Pick<
  EventSchedule,
  | 'answerIcons'
  | 'archivedBy'
  | 'author'
  | 'notificationSettings'
  | 'timezoneOffsetMinutes'
> =>
  IRecord.hasKeyValue(a, 'answerIcons', isAnswerIconSettings) &&
  IRecord.hasKeyValue(
    a,
    'notificationSettings',
    isNotificationSettingsWithNone
  ) &&
  IRecord.hasKeyValue(a, 'timezoneOffsetMinutes', isNumber) &&
  IRecord.hasKeyValue(a, 'author', isUser) &&
  IRecord.hasKeyValue(a, 'archivedBy', isUserList);

export const isEventSchedule = (a: unknown): a is EventSchedule =>
  isRecord(a) && isEventScheduleImpl1(a) && isEventScheduleImpl2(a);

const d = eventScheduleDefaultValue;

export const fillEventSchedule = (a?: unknown): EventSchedule =>
  a === undefined || !isRecord(a)
    ? d
    : {
        title: IRecord.hasKeyValue(a, 'title', isString) ? a.title : d.title,
        notes: IRecord.hasKeyValue(a, 'notes', isString) ? a.notes : d.notes,

        datetimeSpecification: IRecord.hasKeyValue(
          a,
          'datetimeSpecification',
          isDatetimeSpecificationEnumType
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList: IRecord.hasKey(a, 'datetimeRangeList')
          ? IList.isArray(a.datetimeRangeList) &&
            IList.isArrayOfLength1OrMore(a.datetimeRangeList)
            ? IList.map(a.datetimeRangeList, fillDatetimeRange)
            : d.datetimeRangeList
          : d.datetimeRangeList,

        answerDeadline: IRecord.hasKey(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? 'none'
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: IRecord.hasKey(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: IRecord.hasKey(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? 'none'
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: IRecord.hasKeyValue(
          a,
          'timezoneOffsetMinutes',
          isNumber
        )
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: IRecord.hasKey(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy: IRecord.hasKey(a, 'archivedBy')
          ? IList.isArray(a.archivedBy)
            ? IList.map(a.archivedBy, fillUser)
            : d.archivedBy
          : d.archivedBy,
      };
