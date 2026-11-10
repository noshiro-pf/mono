import { searchOf } from '../url/index.mjs';
import {
  dagZoomCodec,
  fitScale,
  zoomInFrom,
  zoomOutFrom,
} from './dag-zoom.mjs';

describe('dagZoomCodec', () => {
  test('reads a percent clamped, or fit, and writes natural as nothing', () => {
    assert.deepStrictEqual(
      dagZoomCodec.read(new URLSearchParams('dag.zoom=125')),
      { kind: 'scale', scale: 1.25 },
    );

    assert.deepStrictEqual(
      dagZoomCodec.read(new URLSearchParams('dag.zoom=9999')),
      { kind: 'scale', scale: 3 },
    );

    assert.deepStrictEqual(
      dagZoomCodec.read(new URLSearchParams('dag.zoom=fit')),
      { kind: 'fit' },
    );

    const params = new URLSearchParams('dag.zoom=50');

    dagZoomCodec.write({ kind: 'scale', scale: 1 }, params);

    assert.strictEqual(searchOf(params), '');
  });
});

describe(zoomInFrom, () => {
  test('steps through the fixed scales', () => {
    assert.strictEqual(zoomInFrom(1), 1.1);

    assert.strictEqual(zoomInFrom(0.8), 0.9);

    assert.strictEqual(zoomOutFrom(0.8), 0.75);

    assert.strictEqual(zoomInFrom(3), 3);
  });
});

describe(fitScale, () => {
  test('fits, never above natural size', () => {
    assert.strictEqual(
      fitScale({ width: 2000, height: 100 }, { width: 1000, height: 500 }),
      0.5,
    );

    assert.strictEqual(
      fitScale({ width: 100, height: 100 }, { width: 1000, height: 500 }),
      1,
    );
  });
});
