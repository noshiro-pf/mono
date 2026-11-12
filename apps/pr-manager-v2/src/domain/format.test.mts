import {
  countOf,
  describeAge,
  describeInterval,
  formatLocalTime,
  instantMsOf,
} from './format.mjs';

describe(describeAge, () => {
  test.each([
    [-5000, 'just now'],
    [500, 'just now'],
    [1000, '1 second ago'],
    [59_000, '59 seconds ago'],
    [120_000, '2 minutes ago'],
    [3_600_000, '1 hour ago'],
    [3 * 86_400_000, '3 days ago'],
  ] as const)('%d ms is %s', (elapsed, expected) => {
    assert.strictEqual(describeAge(0, elapsed), expected);
  });
});

describe(instantMsOf, () => {
  test('reads a time with an offset, as a commit date carries', () => {
    assert.strictEqual(
      instantMsOf('2026-11-10T18:05:00+09:00'),
      instantMsOf('2026-11-10T09:05:00Z'),
    );

    assert.isNaN(instantMsOf('not a time'));
  });
});

describe('a time that did not parse', () => {
  test('is said to be unknown rather than throwing', () => {
    assert.strictEqual(describeAge(Number.NaN, 0), 'at an unknown time');

    assert.strictEqual(formatLocalTime(Number.NaN), 'an unknown time');
  });
});

describe(describeInterval, () => {
  test.each([
    [15_000, '15 seconds'],
    [60_000, '1 minute'],
    [90_000, '1 minute 30 seconds'],
    [0, '0 seconds'],
    [Number.NaN, '0 seconds'],
  ] as const)('%d ms is %s', (ms, expected) => {
    assert.strictEqual(describeInterval(ms), expected);
  });
});

test(countOf, () => {
  assert.strictEqual(countOf(1, 'issue'), '1 issue');

  assert.strictEqual(countOf(0, 'issue'), '0 issues');
});
