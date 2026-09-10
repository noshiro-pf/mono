import {
  clampPaneZoom,
  defaultPaneZoom,
  formatPaneZoom,
  paneZoomLevels,
  steppedPaneZoom,
} from '../src/index.mjs';

describe('steppedPaneZoom', () => {
  test('moves one step along the ladder', () => {
    assert.deepStrictEqual(steppedPaneZoom(1, 'in'), 1.1);

    assert.deepStrictEqual(steppedPaneZoom(1, 'out'), 0.9);
  });

  test('steps from a level that is not exact, such as 0.67', () => {
    assert.deepStrictEqual(steppedPaneZoom(0.67, 'in'), 0.75);

    assert.deepStrictEqual(steppedPaneZoom(0.67, 'out'), 0.5);
  });

  test('lands on the ladder from a value that is not on it', () => {
    assert.deepStrictEqual(steppedPaneZoom(1.3, 'in'), 1.5);

    assert.deepStrictEqual(steppedPaneZoom(1.3, 'out'), 1.25);
  });

  // What the toolbar asks in order to know whether to disable a button.
  test('stays where it is at either end', () => {
    assert.deepStrictEqual(steppedPaneZoom(2, 'in'), 2);

    assert.deepStrictEqual(steppedPaneZoom(0.5, 'out'), 0.5);
  });

  test('reset is one step whatever it is at', () => {
    assert.deepStrictEqual(steppedPaneZoom(2, 'reset'), defaultPaneZoom);

    assert.deepStrictEqual(steppedPaneZoom(0.5, 'reset'), defaultPaneZoom);
  });
});

describe('clampPaneZoom', () => {
  test('bounds both ends at the ladder itself', () => {
    assert.deepStrictEqual(clampPaneZoom(0.01), paneZoomLevels[0]);

    assert.deepStrictEqual(clampPaneZoom(99), paneZoomLevels.at(-1));
  });

  test('keeps a value in range as it is, on the ladder or not', () => {
    assert.deepStrictEqual(clampPaneZoom(1.25), 1.25);

    assert.deepStrictEqual(clampPaneZoom(1.3), 1.3);
  });

  test('falls back for a value that is not a number', () => {
    assert.deepStrictEqual(clampPaneZoom(Number.NaN), defaultPaneZoom);

    assert.deepStrictEqual(
      clampPaneZoom(Number.POSITIVE_INFINITY),
      defaultPaneZoom,
    );
  });
});

describe('formatPaneZoom', () => {
  test('is a whole percentage', () => {
    assert.deepStrictEqual(formatPaneZoom(1), '100%');

    assert.deepStrictEqual(formatPaneZoom(0.67), '67%');

    assert.deepStrictEqual(formatPaneZoom(1.75), '175%');
  });
});
