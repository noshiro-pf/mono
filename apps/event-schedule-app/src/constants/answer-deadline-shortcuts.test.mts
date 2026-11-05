import { createAnswerDeadlineShortcuts } from './answer-deadline-shortcuts.mjs';

describe(createAnswerDeadlineShortcuts, () => {
  test('counts every shortcut from the day it is given, ending at 23:59', () => {
    const shortcuts = createAnswerDeadlineShortcuts(
      new Date(2026, 10, 30, 9, 0),
    );

    assert.deepStrictEqual(
      shortcuts.map(({ label, value }) => `${label}: ${value}`),
      [
        'Today: 2026-11-30T23:59',
        'Tomorrow: 2026-12-01T23:59',
        '1 week later: 2026-12-07T23:59',
        '2 week later: 2026-12-14T23:59',
        '1 month later: 2026-12-30T23:59',
      ],
    );
  });

  test('"1 month later" from 31 January is the end of February', () => {
    const oneMonthLater = createAnswerDeadlineShortcuts(
      new Date(2027, 0, 31, 9, 0),
    ).find(({ label }) => label === '1 month later');

    assert.strictEqual(oneMonthLater?.value, '2027-02-28T23:59');
  });
});
