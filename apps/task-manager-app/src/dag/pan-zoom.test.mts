import { type FixedLengthTuple } from 'ts-type-forge';
import {
  fitBoundsTransform,
  fitViewTransform,
  fitWidthTopTransform,
  interpolateTransform,
  MAX_SCALE,
  MIN_SCALE,
  panBy,
  pinchViewTransform,
  wheelZoomFactor,
  zoomAt,
  type ViewTransform,
} from './pan-zoom.mjs';

const identity: ViewTransform = { x: 0, y: 0, scale: 1 } as const;

/** Where the content point `(cx, cy)` is drawn on the screen. */
const toScreen = (
  { x, y, scale }: ViewTransform,
  cx: number,
  cy: number,
): FixedLengthTuple<2, number> => [x + cx * scale, y + cy * scale] as const;

describe(panBy, () => {
  test('moves the content by the pointer’s movement', () => {
    assert.deepStrictEqual(panBy(identity, 10, -5), {
      x: 10,
      y: -5,
      scale: 1,
    });
  });
});

describe(zoomAt, () => {
  test('keeps the point under the pointer where it is', () => {
    const before: ViewTransform = { x: 30, y: 40, scale: 2 } as const;

    const after = zoomAt(before, 1.5, 100, 80);

    assert.strictEqual(after.scale, 3);

    // The content point under (100, 80) before the zoom: (35, 20).
    assert.deepStrictEqual(toScreen(before, 35, 20), [100, 80]);

    assert.deepStrictEqual(toScreen(after, 35, 20), [100, 80]);
  });

  test('stops at the scale limits', () => {
    assert.strictEqual(zoomAt(identity, 100, 0, 0).scale, MAX_SCALE);

    assert.strictEqual(zoomAt(identity, 0.0001, 0, 0).scale, MIN_SCALE);
  });
});

describe(fitViewTransform, () => {
  test('scales a large graph down to fit, centred', () => {
    const fitted = fitViewTransform(
      { width: 1000, height: 500 },
      { width: 500, height: 500 },
      0,
    );

    assert.deepStrictEqual(fitted, { x: 0, y: 125, scale: 0.5 });
  });

  test('does not blow a small graph up past its natural size', () => {
    const fitted = fitViewTransform(
      { width: 100, height: 50 },
      { width: 500, height: 300 },
      20,
    );

    assert.deepStrictEqual(fitted, { x: 200, y: 125, scale: 1 });
  });

  test('keeps the padding clear', () => {
    const fitted = fitViewTransform(
      { width: 460, height: 100 },
      { width: 500, height: 500 },
      20,
    );

    assert.strictEqual(fitted.scale, 1);

    assert.strictEqual(fitted.x, 20);
  });

  test('is the identity for an empty view or graph', () => {
    assert.deepStrictEqual(
      fitViewTransform(
        { width: 0, height: 0 },
        { width: 500, height: 500 },
        20,
      ),
      { x: 250, y: 250, scale: 1 },
    );

    assert.deepStrictEqual(
      fitViewTransform(
        { width: 100, height: 100 },
        { width: 0, height: 0 },
        20,
      ),
      { x: -10, y: -10, scale: MIN_SCALE },
    );
  });
});

describe(fitBoundsTransform, () => {
  test('fits a box that does not start at the origin', () => {
    const fitted = fitBoundsTransform(
      { x: -100, y: 50, width: 1000, height: 500 },
      { width: 500, height: 500 },
      0,
    );

    assert.deepStrictEqual(fitted, { x: 50, y: 100, scale: 0.5 });

    // The box's corners land on the screen where `fitViewTransform` puts a
    // box at the origin.
    assert.deepStrictEqual(toScreen(fitted, -100, 50), [0, 125]);

    assert.deepStrictEqual(toScreen(fitted, 900, 550), [500, 375]);
  });
});

describe(fitWidthTopTransform, () => {
  test('fits the width, centred, with the top below the inset', () => {
    const fitted = fitWidthTopTransform(
      { x: -10, y: -20, width: 400, height: 2000 },
      { width: 216, height: 300 },
      { padding: 8, topInset: 60, minScale: 0.25 },
    );

    assert.strictEqual(fitted.scale, 0.5);

    // The left edge 8 in, the top at the inset: the height is not fitted.
    assert.deepStrictEqual(toScreen(fitted, -10, -20), [8, 60]);
  });

  test('centres a narrow column, at its natural size', () => {
    const fitted = fitWidthTopTransform(
      { x: 0, y: 0, width: 200, height: 100 },
      { width: 1000, height: 800 },
      { padding: 16, topInset: 60, minScale: 0.5 },
    );

    assert.strictEqual(fitted.scale, 1);

    assert.deepStrictEqual(toScreen(fitted, 0, 0), [400, 60]);
  });

  test('stops at the least scale, from the left, for the rest to be panned to', () => {
    const fitted = fitWidthTopTransform(
      { x: 0, y: 0, width: 2000, height: 100 },
      { width: 400, height: 800 },
      { padding: 16, topInset: 60, minScale: 0.5 },
    );

    assert.strictEqual(fitted.scale, 0.5);

    assert.deepStrictEqual(toScreen(fitted, 0, 0), [16, 60]);
  });

  test('keeps the least scale for an empty view', () => {
    const fitted = fitWidthTopTransform(
      { x: 0, y: 0, width: 200, height: 100 },
      { width: 0, height: 0 },
      { padding: 16, topInset: 60, minScale: 0.5 },
    );

    assert.strictEqual(fitted.scale, 0.5);
  });
});

describe(interpolateTransform, () => {
  const from: ViewTransform = { x: 0, y: 100, scale: 1 } as const;

  const to: ViewTransform = { x: 200, y: -100, scale: 0.5 } as const;

  test('is `from` at 0 and `to` at 1', () => {
    assert.deepStrictEqual(interpolateTransform(from, to, 0), from);

    assert.deepStrictEqual(interpolateTransform(from, to, 1), to);
  });

  test('moves and scales in a straight line', () => {
    assert.deepStrictEqual(interpolateTransform(from, to, 0.25), {
      x: 50,
      y: 50,
      scale: 0.875,
    });
  });
});

describe(pinchViewTransform, () => {
  test('zooms by how far the fingers spread, about their midpoint', () => {
    const start: ViewTransform = { x: 0, y: 0, scale: 1 } as const;

    const after = pinchViewTransform(
      start,
      [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
      ],
      [
        { x: 50, y: 100 },
        { x: 250, y: 100 },
      ],
    );

    assert.strictEqual(after.scale, 2);

    // The content point between the fingers stays between them.
    assert.deepStrictEqual(toScreen(after, 150, 100), [150, 100]);
  });

  test('pans with the midpoint when the fingers move together', () => {
    const after = pinchViewTransform(
      identity,
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      [
        { x: 10, y: 20 },
        { x: 110, y: 20 },
      ],
    );

    assert.deepStrictEqual(after, { x: 10, y: 20, scale: 1 });
  });

  test('does not zoom when the fingers started on one spot', () => {
    const after = pinchViewTransform(
      identity,
      [
        { x: 10, y: 10 },
        { x: 10, y: 10 },
      ],
      [
        { x: 0, y: 10 },
        { x: 20, y: 10 },
      ],
    );

    assert.strictEqual(after.scale, 1);
  });
});

describe(wheelZoomFactor, () => {
  test('zooms in on a wheel turned away from the reader, out towards', () => {
    assert.isAbove(wheelZoomFactor(-100), 1);

    assert.isBelow(wheelZoomFactor(100), 1);

    assert.strictEqual(wheelZoomFactor(0), 1);
  });

  test('counts a line as 16 pixels', () => {
    assert.closeTo(wheelZoomFactor(3, 1), wheelZoomFactor(48), 1e-12);
  });

  test('is symmetric, so in and out by the same amount cancel', () => {
    assert.closeTo(wheelZoomFactor(120) * wheelZoomFactor(-120), 1, 1e-12);
  });
});
