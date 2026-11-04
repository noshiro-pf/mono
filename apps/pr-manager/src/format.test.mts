import { describeAge, describeInterval } from './format.mjs';

describe(describeAge, () => {
  const noon = 1_758_384_000_000;

  test('answers in the largest unit that is still more than one', () => {
    expect(describeAge(noon - 30 * 60_000, noon)).toBe('30 minutes ago');

    expect(describeAge(noon - 3 * 3_600_000, noon)).toBe('3 hours ago');

    expect(describeAge(noon - 2 * 86_400_000, noon)).toBe('2 days ago');

    expect(describeAge(noon - 42_000, noon)).toBe('42 seconds ago');
  });

  test('does not write "1 hours"', () => {
    expect(describeAge(noon - 3_600_000, noon)).toBe('1 hour ago');
  });

  test('says "just now" rather than "0 seconds ago"', () => {
    expect(describeAge(noon - 999, noon)).toBe('just now');
  });

  test('does not write "1 seconds"', () => {
    expect(describeAge(noon - 1000, noon)).toBe('1 second ago');
  });

  // A report written by a clock slightly ahead of the browser's is a report
  // from the future, and "-1 minutes ago" would read as a bug in the page.
  test('says "just now" for an instant that has not happened here yet', () => {
    expect(describeAge(noon + 30_000, noon)).toBe('just now');
  });
});

describe(describeInterval, () => {
  test('says seconds under a minute', () => {
    expect(describeInterval(15_000)).toBe('15 seconds');
  });

  test('says whole minutes as minutes', () => {
    expect(describeInterval(300_000)).toBe('5 minutes');
  });

  // The interval moves in steps of five seconds, and 290 seconds read as
  // "4.833333333333333 minutes".
  test('says minutes and seconds, never a fraction of a minute', () => {
    expect(describeInterval(290_000)).toBe('4 minutes 50 seconds');

    expect(describeInterval(90_000)).toBe('1 minute 30 seconds');
  });

  test('does not write "1 minutes" or "1 seconds"', () => {
    expect(describeInterval(60_000)).toBe('1 minute');

    expect(describeInterval(61_000)).toBe('1 minute 1 second');
  });

  test('rounds to a whole second, up to a whole minute too', () => {
    expect(describeInterval(14_600)).toBe('15 seconds');

    expect(describeInterval(59_600)).toBe('1 minute');
  });

  test('says "0 seconds" for no time, or a value that is not one', () => {
    expect(describeInterval(0)).toBe('0 seconds');

    expect(describeInterval(-1000)).toBe('0 seconds');

    expect(describeInterval(Number.NaN)).toBe('0 seconds');
  });
});
