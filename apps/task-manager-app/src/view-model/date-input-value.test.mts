import { fromDateInputValue, toDateInputValue } from './date-input-value.mjs';

describe(toDateInputValue, () => {
  test('passes a wall-clock time through, and an empty field as no date', () => {
    assert.strictEqual(
      toDateInputValue('2026-10-09T12:00'),
      '2026-10-09T12:00',
    );

    assert.isNull(toDateInputValue(''));
  });

  test('gives no date for what is not a real date and time', () => {
    assert.isNull(toDateInputValue('2026-02-30T00:00'));

    assert.isNull(toDateInputValue('tomorrow'));
  });
});

describe(fromDateInputValue, () => {
  test('keeps the wall-clock part of the ISO string the picker gives', () => {
    assert.strictEqual(
      fromDateInputValue('2026-10-09T12:34+09:00'),
      '2026-10-09T12:34',
    );

    assert.strictEqual(
      fromDateInputValue('2026-10-09T12:34:56.789Z'),
      '2026-10-09T12:34',
    );
  });

  test('empties the field for a cleared or unreadable value', () => {
    assert.strictEqual(fromDateInputValue(null), '');

    assert.strictEqual(fromDateInputValue('2026-10-09'), '');

    assert.strictEqual(fromDateInputValue('2026-13-09T12:34+09:00'), '');
  });
});
