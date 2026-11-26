import { DatetimeRange, TimeRange } from 'ts-fortress-types';
import { datetimeListReducer } from './select-datetimes-reducer.mjs';

describe('datetimeListReducer, fromCalendar', () => {
  test('adds a date the event does not have at 00:00', () => {
    assert.deepStrictEqual(pick([nov1], [nov1.ymd, nov2.ymd], [nov1]), [
      nov1,
      { ymd: nov2.ymd, timeRange: TimeRange.defaultValue },
    ]);
  });

  test('puts back the rows the event has for a date taken out and ticked again, the times its specification hides included', () => {
    const takenOut = pick(
      [nov1, nov3From10To12, nov3From14To16],
      [nov1.ymd],
      [nov1, nov3From10To12, nov3From14To16],
    );

    assert.deepStrictEqual(takenOut, [nov1]);

    assert.deepStrictEqual(
      pick(
        takenOut,
        [nov1.ymd, nov3From10To12.ymd],
        [nov1, nov3From10To12, nov3From14To16],
      ),
      [nov1, nov3From10To12, nov3From14To16],
    );
  });

  test('adds every date at 00:00 when there is no stored event, as on the create page', () => {
    assert.deepStrictEqual(pick([], [nov3From10To12.ymd], []), [
      { ymd: nov3From10To12.ymd, timeRange: TimeRange.defaultValue },
    ]);
  });
});

/** The list after the calendar is set to `list`. */
const pick = (
  state: readonly DatetimeRange[],
  list: readonly YearMonthDate[],
  stored: readonly DatetimeRange[],
): readonly DatetimeRange[] =>
  datetimeListReducer(state, {
    type: 'fromCalendar',
    list,
    mostFrequentTimeRange: TimeRange.defaultValue,
    stored,
  });

const nov1: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 1 },
  timeRange: TimeRange.defaultValue,
});

const nov2: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 2 },
  timeRange: TimeRange.defaultValue,
});

const nov3From10To12: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 3 },
  timeRange: {
    start: { hours: 10, minutes: 0 },
    end: { hours: 12, minutes: 0 },
  },
});

const nov3From14To16: DatetimeRange = DatetimeRange.fill({
  ymd: { year: 2026, month: 11, date: 3 },
  timeRange: {
    start: { hours: 14, minutes: 0 },
    end: { hours: 16, minutes: 0 },
  },
});
