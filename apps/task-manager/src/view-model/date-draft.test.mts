import { switchDateField } from './date-draft.mjs';

const timeZone = 'Asia/Tokyo';

describe(switchDateField, () => {
  const timed = {
    at: 1_791_592_200_000 /* 2026-10-10T09:30 in Tokyo */,
    allDay: false,
  } as const;

  test('turned on, keeps the day alone', () => {
    assert.strictEqual(
      switchDateField('2026-10-10T09:30', true, timed, 'end', timeZone),
      '2026-10-10',
    );
  });

  test('turned off on the day the date is stored timed on, gives back its time', () => {
    assert.strictEqual(
      switchDateField('2026-10-10', false, timed, 'end', timeZone),
      '2026-10-10T09:30',
    );
  });

  test('turned off on another day, or for a date stored all day, gives the time of the edge', () => {
    assert.strictEqual(
      switchDateField('2026-10-11', false, timed, 'end', timeZone),
      '2026-10-11T23:59',
    );

    assert.strictEqual(
      switchDateField(
        '2026-10-10',
        false,
        { at: 1_791_558_000_000, allDay: true },
        'start',
        timeZone,
      ),
      '2026-10-10T00:00',
    );
  });
});
