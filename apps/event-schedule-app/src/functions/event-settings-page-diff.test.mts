import { EventSchedule } from 'event-schedule-app-shared';
import { DatetimeRange } from 'ts-fortress-types';
import { answerIconsInitialValue } from '../constants/index.mjs';
import { collectEventSettingsPageDiff } from './event-settings-page-diff.mjs';

describe(collectEventSettingsPageDiff, () => {
  describe('datetimeRangeList', () => {
    // #2941: each list was written with the other schedule's specification, so
    // an added date lost its times and a deleted one gained times it never had.
    //
    // The offset changes here too: the dates are wall-clock values in the
    // event's own offset, so they are listed as typed, moved by neither offset,
    // and the offset is an item of its own.
    test('writes an added date as the edited schedule specifies, a deleted one as the stored schedule does, and a changed offset as an item of its own', () => {
      const diff = collectEventSettingsPageDiff(
        stored,
        scheduleWith({
          datetimeSpecification: 'startSpecified',
          datetimeRangeList: [nov2, nov3From10To12],
          timezoneOffsetMinutes: 240,
        }),
        undefined,
        undefined,
      );

      assert.deepStrictEqual(diff.datetimeRangeList, {
        added: ['2026/11/03 10:00～'],
        deleted: ['2026/11/01'],
      });

      assert.strictEqual(diff.timezoneOffsetMinutes, '"-540" → "240"');
    });

    test('writes a start and an end time for a date added with both', () => {
      const diff = collectEventSettingsPageDiff(
        stored,
        scheduleWith({
          datetimeSpecification: 'startAndEndSpecified',
          datetimeRangeList: [nov2, nov3From10To12],
        }),
        undefined,
        undefined,
      );

      assert.deepStrictEqual(diff.datetimeRangeList, {
        added: ['2026/11/03 10:00～12:00'],
        deleted: ['2026/11/01'],
      });
    });

    test('writes an added date without times and a deleted one with its time when the edit takes the times away', () => {
      const diff = collectEventSettingsPageDiff(
        scheduleWith({
          datetimeSpecification: 'endSpecified',
          datetimeRangeList: [nov2, nov3From10To12],
        }),
        stored,
        undefined,
        undefined,
      );

      assert.deepStrictEqual(diff.datetimeRangeList, {
        added: ['2026/11/01'],
        deleted: ['2026/11/03 ～12:00'],
      });
    });

    test('writes both lists alike when the specification is kept', () => {
      const diff = collectEventSettingsPageDiff(
        scheduleWith({ datetimeSpecification: 'startSpecified' }),
        scheduleWith({
          datetimeSpecification: 'startSpecified',
          datetimeRangeList: [nov2, nov3From10To12],
        }),
        undefined,
        undefined,
      );

      assert.deepStrictEqual(diff.datetimeRangeList, {
        added: ['2026/11/03 10:00～'],
        deleted: ['2026/11/01 00:00～'],
      });
    });

    test('is undefined when only the specification changes', () => {
      const diff = collectEventSettingsPageDiff(
        stored,
        scheduleWith({ datetimeSpecification: 'startSpecified' }),
        undefined,
        undefined,
      );

      assert.isUndefined(diff.datetimeRangeList);

      assert.strictEqual(
        diff.datetimeSpecification,
        '"時刻なし" → "開始時刻のみ"',
      );
    });
  });
});

const nov1: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 1 },
  timeRange: {
    start: { hours: 0, minutes: 0 },
    end: { hours: 0, minutes: 0 },
  },
});

const nov2: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 2 },
  timeRange: {
    start: { hours: 0, minutes: 0 },
    end: { hours: 0, minutes: 0 },
  },
});

const nov3From10To12: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 3 },
  timeRange: {
    start: { hours: 10, minutes: 0 },
    end: { hours: 12, minutes: 0 },
  },
});

/** An event with no start or end time, as the database has it. */
const stored: EventSchedule = EventSchedule.fill({
  title: 'event',
  notes: 'memo\n',
  author: { id: 'u1', name: 'alice' },
  // The schema's default leaves every description empty, which the settings
  // page does not let the user save.
  answerIcons: answerIconsInitialValue,
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: [nov1, nov2],
  notificationSettings: 'none',
  timezoneOffsetMinutes: -540,
});

/** `stored` with some of what these tests change. */
const scheduleWith = (
  changes: Readonly<{
    datetimeSpecification?: EventSchedule['datetimeSpecification'];
    datetimeRangeList?: readonly DatetimeRange[];
    timezoneOffsetMinutes?: number;
  }>,
): EventSchedule => EventSchedule.fill({ ...stored, ...changes });
