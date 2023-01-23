import { DateUtils } from '@noshiro/ts-utils';
import {
  defaultNotificationSettings,
  defaultYmdhm,
  fillDatetimeRange,
  fillNotificationSettings,
  fillYmdhm,
  type DatetimeRange,
  type DatetimeSpecificationEnumType,
  type NotificationSettings,
  type PartialDatetimeRange,
  type PartialNotificationSettings,
  type PartialYmdhm,
  type Ymdhm,
} from '../../../v3';
import {
  fillAnswerIconSettings,
  type AnswerIconSettings,
  type PartialAnswerIconSettings,
} from './answer-icon-settings';
import { defaultAnswerIconSetting } from './base';

export type EventSchedule = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRange[];
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  answerIcons: AnswerIconSettings;
  useNotification: boolean;
  notificationSettings: NotificationSettings;
  timezoneOffsetMinutes: number;
}>;

export type PartialEventSchedule = Partial<
  MergeIntersection<
    Pick<
      EventSchedule,
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
        answerIcons: PartialAnswerIconSettings;
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
  answerIcons: {
    good: defaultAnswerIconSetting,
    fair: defaultAnswerIconSetting,
    poor: defaultAnswerIconSetting,
  },
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
  answerIcons: fillAnswerIconSettings(p?.answerIcons ?? d.answerIcons),
  useNotification: p?.useNotification ?? d.useNotification,
  notificationSettings: fillNotificationSettings(
    p?.notificationSettings ?? d.notificationSettings
  ),
  timezoneOffsetMinutes: p?.timezoneOffsetMinutes ?? d.timezoneOffsetMinutes,
});
