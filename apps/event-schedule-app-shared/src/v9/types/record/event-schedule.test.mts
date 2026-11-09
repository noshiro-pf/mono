import { Arr, expectType } from 'ts-data-forge';
import { DatetimeRange, type Ymdhm } from 'ts-fortress-types';
import type { NonEmptyArray } from 'ts-type-forge';
import type { DatetimeSpecificationEnumType } from '../enum/index.mjs';
import type { AnswerIconSettings } from './answer-icon-settings.mjs';
import {
  User,
  createAnswerIconSettingType,
  type NotificationSettings,
} from './base/index.mjs';
import { EventSchedule } from './event-schedule.mjs';

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
      datetimeRangeList: Arr.asNonEmptyArray([DatetimeRange.defaultValue]),
      answerDeadline: 'none',
      answerIcons: {
        good: createAnswerIconSettingType(10).defaultValue,
        fair: createAnswerIconSettingType(6).defaultValue,
        poor: createAnswerIconSettingType(0).defaultValue,
      },
      notificationSettings: 'none',
      // A placeholder, not the offset where and when the module loaded.
      timezoneOffsetMinutes: 0,
      author: User.defaultValue,
      archivedBy: [],
    } as const;

    assert.deepStrictEqual(EventSchedule.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(EventSchedule.is(EventSchedule.defaultValue));
    });
  });

  describe('fill', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        EventSchedule.fill({}),
        EventSchedule.defaultValue,
      );
    });
  });
});
