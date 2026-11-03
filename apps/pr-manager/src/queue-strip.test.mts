import {
  edgesOf,
  NO_STRIP,
  overflows,
  scrollLeftAt,
  tipSideOf,
  windowOf,
} from './queue-strip.mjs';

// 40 boxes of 100px, 8 of them in view.
const strip = (left: number, held = 0) =>
  ({ left, width: 800, scrollWidth: 4000, held }) as const;

const fits = { left: 0, width: 800, scrollWidth: 800, held: 0 } as const;

describe(overflows, () => {
  test('is false before the strip is measured', () => {
    assert.isFalse(overflows(NO_STRIP));
  });

  test('is false when every box fits', () => {
    assert.isFalse(overflows(fits));
  });

  test('is true when the boxes are wider than the strip, by a pixel or more', () => {
    assert.isTrue(overflows(strip(0)));

    assert.isTrue(overflows({ ...fits, scrollWidth: 801 }));
  });
});

describe(windowOf, () => {
  test('is the part of the queue in view, as fractions of the whole', () => {
    assert.deepStrictEqual(windowOf(strip(1000)), { start: 0.25, size: 0.2 });
  });

  test('leaves out what the running box covers once the strip is scrolled', () => {
    // Boxes 10 (under the running one) to 17 are in view; 11 to 17 are seen.
    assert.deepStrictEqual(windowOf(strip(1000, 100)), {
      start: 0.275,
      size: 0.175,
    });

    // Not scrolled, the running box is itself the first in view; nor off the
    // start by a fraction of a pixel.
    assert.deepStrictEqual(windowOf(strip(0, 100)), { start: 0, size: 0.2 });

    assert.deepStrictEqual(windowOf(strip(0.4, 100)), {
      start: 0,
      size: 0.2001,
    });
  });

  test('is the whole queue when it all fits or is not measured yet', () => {
    assert.deepStrictEqual(windowOf(fits), { start: 0, size: 1 });

    assert.deepStrictEqual(windowOf(NO_STRIP), { start: 0, size: 1 });
  });
});

describe(scrollLeftAt, () => {
  test('puts the point clicked in the middle of the strip', () => {
    expect(scrollLeftAt(strip(0), 0.5)).toBe(1600);
  });

  test('puts it in the middle of what is in view beside the running box', () => {
    // The view beside it is 100–800, so its middle is 450 in.
    expect(scrollLeftAt(strip(0, 100), 0.5)).toBe(1550);
  });

  test('stops at either end', () => {
    expect(scrollLeftAt(strip(0), 0.05)).toBe(0);

    expect(scrollLeftAt(strip(0), 0.98)).toBe(3200);
  });

  test('does not scroll a strip that fits', () => {
    expect(scrollLeftAt(fits, 0.9)).toBe(0);
  });
});

describe(edgesOf, () => {
  test('says which ends of the queue are out of view', () => {
    assert.deepStrictEqual(edgesOf(strip(0)), { before: false, after: true });

    assert.deepStrictEqual(edgesOf(strip(1000)), { before: true, after: true });

    assert.deepStrictEqual(edgesOf(strip(3200)), {
      before: true,
      after: false,
    });

    // Off the start by a fraction of a pixel, or by one.
    assert.deepStrictEqual(edgesOf(strip(0.4)), { before: false, after: true });

    assert.deepStrictEqual(edgesOf(strip(1)), { before: true, after: true });

    // Short of the end by one pixel.
    assert.deepStrictEqual(edgesOf(strip(3199)), { before: true, after: true });

    // Short of the end by a fraction of a pixel.
    assert.deepStrictEqual(edgesOf(strip(3199.5)), {
      before: true,
      after: false,
    });
  });

  test('says neither when it all fits', () => {
    assert.deepStrictEqual(edgesOf(fits), { before: false, after: false });
  });
});

describe(tipSideOf, () => {
  test('is from the start for a box in the left half of what is in view', () => {
    // Box 21 is at 2100–2200, 100–200 into the view.
    expect(tipSideOf(strip(2000), 21, 40)).toBe('start');

    // Box 26 is at 2600–2700, 600–700 into the view.
    expect(tipSideOf(strip(2000), 26, 40)).toBe('end');
  });

  test('goes by the order before the strip is measured', () => {
    expect(tipSideOf(NO_STRIP, 2, 10)).toBe('start');

    expect(tipSideOf(NO_STRIP, 7, 10)).toBe('end');
  });
});
