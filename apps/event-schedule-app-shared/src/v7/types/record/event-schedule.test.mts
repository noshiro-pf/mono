import { Arr, expectType } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type NonEmptyArray } from 'ts-type-forge';
import { type DatetimeSpecificationEnumType } from '../enum/index.mjs';
import { type AnswerIconSettings } from './answer-icon-settings.mjs';
import {
  answerIconSettingTypeDef,
  userDefaultValue,
  type NotificationSettings,
  type User,
  type Ymdhm,
} from './base/index.mjs';
import {
  datetimeRangeDefaultValue,
  type DatetimeRange,
} from './datetime-range.mjs';
import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
  type EventSchedule,
} from './event-schedule.mjs';

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
      datetimeRangeList: Arr.asNonEmptyArray([datetimeRangeDefaultValue]),
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
    } as const;

    assert.deepStrictEqual(eventScheduleDefaultValue, defaultValue);
  });

  describe('isEventSchedule', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isEventSchedule(eventScheduleDefaultValue));
    });
  });

  describe('fillEventSchedule', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(fillEventSchedule({}), eventScheduleDefaultValue);
    });
  });
});
