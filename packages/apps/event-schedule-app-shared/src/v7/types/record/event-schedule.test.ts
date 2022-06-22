import { assertType, IDate } from '@noshiro/ts-utils';
import type { DatetimeSpecificationEnumType } from '../enum';
import type { AnswerIconSettings } from './answer-icon-settings';
import type { NotificationSettings, User, Ymdhm } from './base';
import { answerIconSettingTypeDef, userDefaultValue } from './base';
import type { DatetimeRange } from './datetime-range';
import { datetimeRangeDefaultValue } from './datetime-range';

import type { EventSchedule } from './event-schedule';
import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
} from './event-schedule';

describe('EventSchedule', () => {
  assertType<
    TypeEq<
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
    >
  >();

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
      timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
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
