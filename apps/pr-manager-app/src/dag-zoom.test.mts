import {
  centreAt,
  fitScale,
  MAX_SCALE,
  MIN_SCALE,
  scrollToCentre,
  zoomInFrom,
  zoomOutFrom,
} from './dag-zoom.mjs';

describe(fitScale, () => {
  test('shrinks a graph larger than the box until all of it is in the box', () => {
    // Wider than the box by more than it is taller.
    expect(
      fitScale({ width: 2000, height: 600 }, { width: 1000, height: 500 }),
    ).toBe(0.5);

    // Taller than the box by more than it is wider.
    expect(
      fitScale({ width: 1200, height: 2000 }, { width: 1000, height: 500 }),
    ).toBe(0.25);
  });

  test('never draws a graph that already fits larger than its natural size', () => {
    expect(
      fitScale({ width: 400, height: 200 }, { width: 1000, height: 500 }),
    ).toBe(1);
  });

  test('stops at the smallest scale, however large the graph', () => {
    expect(
      fitScale({ width: 100_000, height: 600 }, { width: 1000, height: 500 }),
    ).toBe(MIN_SCALE);
  });

  test('is the natural size while the box has not been measured', () => {
    expect(
      fitScale({ width: 2000, height: 600 }, { width: 0, height: 0 }),
    ).toBe(1);
  });

  test('rounds down, so that the drawn graph never overflows the box by a fraction of a pixel', () => {
    const scale = fitScale(
      { width: 3000, height: 100 },
      { width: 1000, height: 500 },
    );

    expect(scale).toBeLessThanOrEqual(1 / 3);

    expect(scale).toBeGreaterThan(0.33);
  });
});

describe(zoomInFrom, () => {
  test('goes to the next step up', () => {
    expect(zoomInFrom(1)).toBe(1.1);

    expect(zoomInFrom(0.5)).toBe(0.67);
  });

  test('goes from a scale between two steps to the one above it', () => {
    expect(zoomInFrom(0.43)).toBe(0.5);
  });

  test('stays at the largest scale', () => {
    expect(zoomInFrom(MAX_SCALE)).toBe(MAX_SCALE);
  });
});

describe(zoomOutFrom, () => {
  test('goes to the next step down', () => {
    expect(zoomOutFrom(1)).toBe(0.9);

    expect(zoomOutFrom(2)).toBe(1.75);
  });

  test('goes from a scale between two steps to the one below it', () => {
    expect(zoomOutFrom(0.43)).toBe(0.33);
  });

  test('stays at the smallest scale', () => {
    expect(zoomOutFrom(MIN_SCALE)).toBe(MIN_SCALE);
  });

  test('a zoom in and a zoom out from a step come back to it', () => {
    expect(zoomOutFrom(zoomInFrom(0.75))).toBe(0.75);
  });
});

describe(centreAt, () => {
  test('is the point of the graph at the middle of the box, in the units of the layout', () => {
    assert.deepStrictEqual(
      centreAt(
        { left: 300, top: 100, width: 400, height: 200 },
        { width: 1000, height: 500 },
        2,
      ),
      { x: 250, y: 100 },
    );
  });

  test('across which the whole graph is in the box, is the middle of the graph', () => {
    // Drawn 600 across and 1000 down, in a box 800 across and 200 down.
    assert.deepStrictEqual(
      centreAt(
        { left: 0, top: 100, width: 800, height: 200 },
        { width: 300, height: 500 },
        2,
      ),
      { x: 150, y: 100 },
    );
  });
});

describe(scrollToCentre, () => {
  test('scrolls so that the point is at the middle of the box at the new scale', () => {
    assert.deepStrictEqual(
      scrollToCentre({ x: 250, y: 100 }, { width: 400, height: 200 }, 4),
      { left: 800, top: 300 },
    );
  });

  test('a zoom keeps the middle of the box over the same point of the graph', () => {
    const box = { width: 400, height: 200 } as const;

    const content = { width: 1000, height: 500 } as const;

    const centre = centreAt({ ...box, left: 300, top: 100 }, content, 2);

    const scrolled = scrollToCentre(centre, box, 3);

    assert.deepStrictEqual(
      centreAt({ ...box, ...scrolled }, content, 3),
      centre,
    );
  });

  test('never scrolls before the start of the graph', () => {
    assert.deepStrictEqual(
      scrollToCentre({ x: 50, y: 20 }, { width: 400, height: 200 }, 1),
      { left: 0, top: 0 },
    );
  });
});
