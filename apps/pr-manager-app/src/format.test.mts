import { describeAge, describeComparison } from './format.mjs';

describe(describeComparison, () => {
  test('writes both counts, the behind one being the one that blocks', () => {
    expect(describeComparison({ aheadBy: 3, behindBy: 12 })).toBe('+3 / -12');
  });

  test('says so when the comparison could not be read', () => {
    expect(describeComparison(null)).toBe('ahead/behind unread');
  });
});

describe(describeAge, () => {
  const noon = 1_758_384_000_000;

  test('answers in the largest unit that is still more than one', () => {
    expect(describeAge(noon - 30 * 60_000, noon)).toBe('30 minutes ago');

    expect(describeAge(noon - 3 * 3_600_000, noon)).toBe('3 hours ago');

    expect(describeAge(noon - 2 * 86_400_000, noon)).toBe('2 days ago');
  });

  test('does not write "1 hours"', () => {
    expect(describeAge(noon - 3_600_000, noon)).toBe('1 hour ago');
  });

  test('says "just now" rather than "0 minutes ago"', () => {
    expect(describeAge(noon - 30_000, noon)).toBe('just now');
  });

  // A report written by a clock slightly ahead of the browser's is a report
  // from the future, and "-1 minutes ago" would read as a bug in the page.
  test('says "just now" for an instant that has not happened here yet', () => {
    expect(describeAge(noon + 30_000, noon)).toBe('just now');
  });
});
