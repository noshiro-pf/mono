import { DateUtils } from 'ts-fortress-types';
import { createAnswerDeadlineShortcuts } from './answer-deadline-shortcuts.mjs';

describe(createAnswerDeadlineShortcuts, () => {
  test('counts every shortcut from the day it is given, ending at 23:59', () => {
    const shortcuts = createAnswerDeadlineShortcuts(
      new Date(2026, 10, 30, 9, 0),
    );

    assert.deepStrictEqual(
      shortcuts.map(
        ({ label, date }) =>
          `${label}: ${DateUtils.toLocaleYMD(date, '-')} ${DateUtils.toLocaleHM(date, ':')}`,
      ),
      [
        'Today: 2026-11-30 23:59',
        'Tomorrow: 2026-12-01 23:59',
        '1 week later: 2026-12-07 23:59',
        '2 week later: 2026-12-14 23:59',
        '1 month later: 2026-12-30 23:59',
      ],
    );
  });
});
