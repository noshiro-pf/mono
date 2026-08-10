import { DateUtils, expectType } from '@noshiro/ts-utils';
import {
  defaultAnswerIconSetting,
  defaultNotificationSettings,
  defaultYmdhm,
  fillAnswerIconSettings,
  fillDatetimeRange,
  fillNotificationSettings,
  fillYmdhm,
  type AnswerIconSettings,
  type DatetimeRange,
  type DatetimeSpecificationEnumType,
  type NotificationSettings,
  type PartialAnswerIconSettings,
  type PartialDatetimeRange,
  type PartialNotificationSettings,
  type PartialYmdhm,
  type Ymdhm,
} from '../../../v4/index.mjs';
import { fillUser, userDefaultValue, type User } from './base/index.mjs';

export type EventSchedule = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRange[];
  answerDeadline: Ymdhm | 'none';
  answerIcons: AnswerIconSettings;
  notificationSettings: NotificationSettings | 'none';
  timezoneOffsetMinutes: number;
  author: User;
}>;

export type PartialEventSchedule = Partial<
  MergeIntersection<
    Pick<
      EventSchedule,
      | 'author'
      | 'datetimeSpecification'
      | 'notes'
      | 'timezoneOffsetMinutes'
      | 'title'
    > &
      Readonly<{
        datetimeRangeList: readonly PartialDatetimeRange[];
        answerDeadline: PartialYmdhm | 'none';
        answerIcons: PartialAnswerIconSettings;
        notificationSettings: PartialNotificationSettings | 'none';
      }>
  >
>;

expectType<keyof EventSchedule, keyof PartialEventSchedule>('=');
expectType<EventSchedule, PartialEventSchedule>('<=');

export const eventScheduleDefaultValue = {
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: [],
  answerDeadline: 'none',
  answerIcons: {
    good: defaultAnswerIconSetting,
    fair: defaultAnswerIconSetting,
    poor: defaultAnswerIconSetting,
  },
  notificationSettings: 'none',
  timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
  author: userDefaultValue,
} as const satisfies EventSchedule;

const d = eventScheduleDefaultValue;
export const fillEventSchedule = (p?: PartialEventSchedule): EventSchedule => ({
  title: p?.title ?? d.title,
  notes: p?.notes ?? d.notes,
  datetimeSpecification: p?.datetimeSpecification ?? d.datetimeSpecification,
  datetimeRangeList: (p?.datetimeRangeList ?? d.datetimeRangeList).map(
    fillDatetimeRange,
  ),
  answerDeadline:
    p?.answerDeadline === 'none'
      ? 'none'
      : fillYmdhm(p?.answerDeadline ?? defaultYmdhm),
  answerIcons: fillAnswerIconSettings(p?.answerIcons ?? d.answerIcons),
  notificationSettings:
    p?.notificationSettings === 'none'
      ? 'none'
      : fillNotificationSettings(
          p?.notificationSettings ?? defaultNotificationSettings,
        ),
  timezoneOffsetMinutes: p?.timezoneOffsetMinutes ?? d.timezoneOffsetMinutes,
  author: fillUser(p?.author ?? userDefaultValue),
});
