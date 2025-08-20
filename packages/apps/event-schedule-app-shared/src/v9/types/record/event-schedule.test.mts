import { DatetimeRange, type Ymdhm } from '@noshiro/io-ts-types';
import { DateUtils, expectType } from '@noshiro/ts-utils';
import { type DatetimeSpecificationEnumType } from '../enum/index.mjs';
import { type AnswerIconSettings } from './answer-icon-settings.mjs';
import {
  createAnswerIconSettingType,
  type NotificationSettings,
  User,
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
      createdAt: number;
      updatedAt: number;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: EventSchedule = {
      title: '',
      notes: '',
      datetimeSpecification: 'noStartEndSpecified',
      datetimeRangeList: [DatetimeRange.defaultValue],
      answerDeadline: 'none',
      answerIcons: {
        good: createAnswerIconSettingType(10).defaultValue,
        fair: createAnswerIconSettingType(6).defaultValue,
        poor: createAnswerIconSettingType(0).defaultValue,
      },
      notificationSettings: 'none',
      timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
      author: User.defaultValue,
      archivedBy: [],
      createdAt: 0,
      updatedAt: 0,
    };

    expect(EventSchedule.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(EventSchedule.is(EventSchedule.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('defaultValue should be true', () => {
      expect(EventSchedule.fill({})).toStrictEqual(EventSchedule.defaultValue);
    });
  });
});
