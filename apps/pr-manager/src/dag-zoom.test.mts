import {
  centreAt,
  dagZoomFromSearch,
  fitPlacement,
  fitScale,
  MAX_SCALE,
  MIN_SCALE,
  scrollToCentre,
  searchWithDagZoom,
  ZOOM_STEPS,
  zoomInFrom,
  zoomOutFrom,
} from './dag-zoom.mjs';
import {
  layoutConnected,
  placeGrid,
  placementsFor,
} from './issue-graph-layout.mjs';
import type { IssueGraph } from './issue-graph.mjs';

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

describe(fitPlacement, () => {
  test('arranges what has no edge so that the whole graph is drawn the largest the box allows', () => {
    const parts = layoutConnected(chainAndFree(3, 24));

    const box = { width: 2400, height: 400 } as const;

    const best = fitScale(placeGrid(parts, fitPlacement(parts, box)), box);

    const scales = placementsFor(parts).map((placement) =>
      fitScale(placeGrid(parts, placement), box),
    );

    assert.strictEqual(best, Math.max(...scales));

    // Under the chain, three or so to a row, it would be tall and small.
    assert.isAbove(best, scales[0] ?? 1);
  });

  test('keeps the default arrangement while that already fits at its natural size', () => {
    const parts = layoutConnected(chainAndFree(2, 4));

    assert.deepStrictEqual(
      fitPlacement(parts, { width: 4000, height: 4000 }),
      placementsFor(parts)[0],
    );
  });
});

/** A chain of `chain` issues, and `free` more with no edge at all. */
const chainAndFree = (chain: number, free: number): IssueGraph =>
  ({
    nodes: Array.from({ length: chain + free }, (_, index) => ({
      number: index + 1,
      kind: 'issue',
      title: `Issue ${index + 1}`,
      url: `https://github.com/o/r/issues/${index + 1}`,
      state: 'free',
      priority: 'none',
      pending: false,
    })),
    edges: Array.from({ length: chain - 1 }, (_, index) => ({
      from: index + 1,
      to: index + 2,
      kind: 'start-after',
      settled: false,
    })),
  }) as const;

describe(dagZoomFromSearch, () => {
  test('reads a scale in percent, and the fit', () => {
    assert.deepStrictEqual(dagZoomFromSearch('?zoom=125'), {
      type: 'scale',
      scale: 1.25,
    });

    assert.deepStrictEqual(dagZoomFromSearch('?zoom=33'), {
      type: 'scale',
      scale: 0.33,
    });

    assert.deepStrictEqual(dagZoomFromSearch('?a=1&zoom=fit'), {
      type: 'fit',
    });
  });

  test('reads no parameter, or one it cannot read, as the natural size', () => {
    for (const search of [
      '',
      '?zoom=',
      '?zoom=big',
      '?zoom=Fit',
      '?zoom=-50',
    ]) {
      assert.deepStrictEqual(dagZoomFromSearch(search), {
        type: 'scale',
        scale: 1,
      });
    }
  });

  test('clamps a scale out of range to the nearest end', () => {
    assert.deepStrictEqual(dagZoomFromSearch('?zoom=1'), {
      type: 'scale',
      scale: MIN_SCALE,
    });

    assert.deepStrictEqual(dagZoomFromSearch('?zoom=1000'), {
      type: 'scale',
      scale: MAX_SCALE,
    });

    // More digits than a number holds.
    assert.deepStrictEqual(dagZoomFromSearch(`?zoom=${'9'.repeat(400)}`), {
      type: 'scale',
      scale: MAX_SCALE,
    });
  });
});

describe(searchWithDagZoom, () => {
  test('writes a scale in percent, and the fit', () => {
    assert.strictEqual(
      searchWithDagZoom('', { type: 'scale', scale: 1.25 }),
      '?zoom=125',
    );

    assert.strictEqual(
      searchWithDagZoom('?zoom=125', { type: 'scale', scale: 0.33 }),
      '?zoom=33',
    );

    assert.strictEqual(searchWithDagZoom('', { type: 'fit' }), '?zoom=fit');
  });

  test('writes the natural size as the absence of the parameter', () => {
    assert.strictEqual(
      searchWithDagZoom('?zoom=fit', { type: 'scale', scale: 1 }),
      '',
    );
  });

  test('keeps the other parameters where they were', () => {
    assert.strictEqual(
      searchWithDagZoom('?a=1&zoom=fit&b=2', { type: 'scale', scale: 2 }),
      '?a=1&zoom=200&b=2',
    );

    assert.strictEqual(
      searchWithDagZoom('?a=1&zoom=fit', { type: 'scale', scale: 1 }),
      '?a=1',
    );
  });

  test('what it writes reads back as it was, the fit and every step', () => {
    assert.deepStrictEqual(
      dagZoomFromSearch(searchWithDagZoom('', { type: 'fit' })),
      { type: 'fit' },
    );

    for (const scale of ZOOM_STEPS) {
      assert.deepStrictEqual(
        dagZoomFromSearch(searchWithDagZoom('', { type: 'scale', scale })),
        { type: 'scale', scale },
      );
    }
  });
});
