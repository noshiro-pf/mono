/**
 * A range of days, each `YYYY-MM-DD` or `''` for none: what Blueprint's
 * `DateRange` is with its dates at 00:00. The start first.
 */
export type DayRange = readonly [start: string, end: string];

/** The end of a range that a press changes: Blueprint's `Boundary`. */
export type Boundary = 'end' | 'start';

/**
 * What a press on `day` makes of `current`, and the end it leaves to be picked
 * next: Blueprint's `DateRangeSelectionStrategy.getNextState`. With `boundary`,
 * the press changes that end; without, it starts a new range or finishes the
 * one begun.
 */
export const nextRangeState = (
  current: DayRange,
  day: string,
  allowSingleDayRange: boolean,
  boundary: Boundary | undefined,
): Readonly<{ range: DayRange; boundary: Boundary }> =>
  boundary === undefined
    ? defaultNextState(current, day, allowSingleDayRange)
    : nextStateForBoundary(current, day, allowSingleDayRange, boundary);

/** The other end of a range. */
export const otherOf = (boundary: Boundary): Boundary =>
  boundary === 'start' ? 'end' : 'start';

/** The day at `boundary` of `range`. */
export const endOf = (boundary: Boundary, [start, end]: DayRange): string =>
  boundary === 'start' ? start : end;

/** Blueprint's `createRange`: none for one day unless allowed. */
const rangeOf = (
  a: string,
  b: string,
  allowSingleDayRange: boolean,
): DayRange =>
  !allowSingleDayRange && a === b
    ? (['', ''] as const)
    : a < b
      ? ([a, b] as const)
      : ([b, a] as const);

const defaultNextState = (
  [start, end]: DayRange,
  day: string,
  allowSingleDayRange: boolean,
): Readonly<{ range: DayRange; boundary: Boundary }> => {
  if (start === '' && end === '') {
    return { range: [day, ''], boundary: 'start' };
  }

  if (end === '') {
    return {
      range: rangeOf(day, start, allowSingleDayRange),
      boundary: 'end',
    };
  }

  if (start === '') {
    return {
      range: rangeOf(day, end, allowSingleDayRange),
      boundary: 'start',
    };
  }

  const isStart = start === day;

  const isEnd = end === day;

  return isStart && isEnd
    ? { range: ['', ''], boundary: 'start' }
    : isStart
      ? { range: ['', end], boundary: 'start' }
      : isEnd
        ? { range: [start, ''], boundary: 'end' }
        : { range: [day, ''], boundary: 'start' };
};

const nextStateForBoundary = (
  current: DayRange,
  day: string,
  allowSingleDayRange: boolean,
  boundary: Boundary,
): Readonly<{ range: DayRange; boundary: Boundary }> => {
  const other = otherOf(boundary);

  const boundaryDay = endOf(boundary, current);

  const otherDay = endOf(other, current);

  const make = (ofBoundary: string, ofOther: string): DayRange =>
    boundary === 'start'
      ? ([ofBoundary, ofOther] as const)
      : ([ofOther, ofBoundary] as const);

  if (boundaryDay === '' && otherDay === '') {
    return { range: make(day, ''), boundary };
  }

  if (otherDay === '') {
    return { range: make(boundaryDay === day ? '' : day, ''), boundary };
  }

  /** Whether `at`, as `boundary`, would pass the other end. */
  const overlaps = (at: string): boolean =>
    boundary === 'start' ? at > otherDay : at < otherDay;

  if (boundaryDay === '') {
    if (day === otherDay) {
      return allowSingleDayRange
        ? { range: make(otherDay, otherDay), boundary }
        : { range: make('', ''), boundary: other };
    }

    return overlaps(day)
      ? { range: make(otherDay, day), boundary: other }
      : { range: make(day, otherDay), boundary };
  }

  if (boundaryDay === day) {
    return {
      range: make('', boundaryDay === otherDay ? '' : otherDay),
      boundary,
    };
  }

  if (day === otherDay) {
    return allowSingleDayRange
      ? { range: make(otherDay, otherDay), boundary }
      : { range: make(boundaryDay, ''), boundary: other };
  }

  return overlaps(day)
    ? { range: make(day, ''), boundary }
    : { range: make(day, otherDay), boundary };
};

if (import.meta.vitest !== undefined) {
  const day = (n: number): string =>
    `2026-10-${n.toString().padStart(2, '0')}` as const;

  describe(nextRangeState, () => {
    test('starts a range, finishes it, and starts again', () => {
      assert.deepStrictEqual(
        nextRangeState(['', ''], day(5), false, undefined),
        {
          range: [day(5), ''],
          boundary: 'start',
        },
      );

      assert.deepStrictEqual(
        nextRangeState([day(5), ''], day(2), false, undefined),
        { range: [day(2), day(5)], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(2), day(5)], day(9), false, undefined),
        { range: [day(9), ''], boundary: 'start' },
      );
    });

    test('takes one day for a range only when allowed', () => {
      assert.deepStrictEqual(
        nextRangeState([day(5), ''], day(5), false, undefined).range,
        ['', ''],
      );

      assert.deepStrictEqual(
        nextRangeState([day(5), ''], day(5), true, undefined).range,
        [day(5), day(5)],
      );
    });

    test('lets a press on an end take it away', () => {
      assert.deepStrictEqual(
        nextRangeState([day(2), day(5)], day(2), false, undefined),
        { range: ['', day(5)], boundary: 'start' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(2), day(5)], day(5), false, undefined),
        { range: [day(2), ''], boundary: 'end' },
      );
    });

    test('changes the end it is given, and starts again past the other', () => {
      assert.deepStrictEqual(
        nextRangeState([day(2), day(5)], day(8), false, 'end'),
        { range: [day(2), day(8)], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(2), day(5)], day(1), false, 'end'),
        { range: ['', day(1)], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState(['', day(5)], day(8), false, 'start'),
        { range: [day(5), day(8)], boundary: 'end' },
      );
    });

    test('given an end, starts with it, takes it away, and meets the other end', () => {
      assert.deepStrictEqual(nextRangeState(['', ''], day(4), false, 'end'), {
        range: ['', day(4)],
        boundary: 'end',
      });

      assert.deepStrictEqual(
        nextRangeState([day(4), ''], day(4), false, 'start'),
        { range: ['', ''], boundary: 'start' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(4), ''], day(9), false, 'end'),
        { range: [day(4), day(9)], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState(['', day(9)], day(9), false, 'start'),
        { range: ['', ''], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState(['', day(9)], day(9), true, 'start'),
        { range: [day(9), day(9)], boundary: 'start' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(4), day(9)], day(4), false, 'start'),
        { range: ['', day(9)], boundary: 'start' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(4), day(9)], day(9), false, 'start'),
        { range: [day(4), ''], boundary: 'end' },
      );

      assert.deepStrictEqual(
        nextRangeState([day(4), day(9)], day(9), true, 'start'),
        { range: [day(9), day(9)], boundary: 'start' },
      );
    });

    test('without an end given, a press on the end alone picks the start', () => {
      assert.deepStrictEqual(
        nextRangeState(['', day(9)], day(3), false, undefined),
        { range: [day(3), day(9)], boundary: 'start' },
      );
    });
  });
}
