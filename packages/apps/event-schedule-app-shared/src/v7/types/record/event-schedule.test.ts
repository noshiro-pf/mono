import { DateUtils, expectType } from '@noshiro/ts-utils';
import { type DatetimeSpecificationEnumType } from '../enum';
import { type AnswerIconSettings } from './answer-icon-settings';
import {
  answerIconSettingTypeDef,
  userDefaultValue,
  type NotificationSettings,
  type User,
  type Ymdhm,
} from './base';
import {
  datetimeRangeDefaultValue,
  type DatetimeRange,
} from './datetime-range';

import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
  type EventSchedule,
} from './event-schedule';

describe('EventSchedule', () => {
  expectType<
    EventSchedule,
    Readonly<{
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
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: EventSchedule = {
      title: '',
      notes: '',
      datetimeSpecification: 'noStartEndSpecified',
      datetimeRangeList: [datetimeRangeDefaultValue],
      answerDeadline: 'none',
      answerIcons: {
        good: answerIconSettingTypeDef(10).defaultValue,
        fair: answerIconSettingTypeDef(6).defaultValue,
        poor: answerIconSettingTypeDef(0).defaultValue,
      },
      notificationSettings: 'none',
      timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
      author: userDefaultValue,
      archivedBy: [],
    };

    expect(eventScheduleDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isEventSchedule', () => {
    test('defaultValue should be true', () => {
      expect(isEventSchedule(eventScheduleDefaultValue)).toBe(true);
    });
  });

  describe('fillEventSchedule', () => {
    test('defaultValue should be true', () => {
      expect(fillEventSchedule({})).toStrictEqual(eventScheduleDefaultValue);
    });
  });
});
