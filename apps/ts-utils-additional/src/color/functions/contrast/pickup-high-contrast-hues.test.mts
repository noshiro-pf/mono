import { Arr, asPositiveUint32, asUint32 } from 'ts-data-forge';
import { pickupHighContrastHues } from './pickup-high-contrast-hues.mjs';

const percents = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

describe(pickupHighContrastHues, () => {
  test('returns undefined for n = 0', () => {
    expect(pickupHighContrastHues(asUint32(0), 50, 50)).toBeUndefined();
  });

  test('returns exactly n hues', () => {
    // The threshold after the n-th pick, `maxValue * n / n`, can round one ulp
    // below `maxValue`, which let the last accumulated value be picked as an
    // (n + 1)-th hue. Before the fix, 49 of these 1452 inputs returned n + 1
    // hues, e.g. (n, saturation, lightness) = (3, 20, 80).
    for (const n of Arr.range(1, 13)) {
      for (const saturation of percents) {
        for (const lightness of percents) {
          const hues = pickupHighContrastHues(
            asPositiveUint32(n),
            saturation,
            lightness,
          );

          expect(hues).toHaveLength(n);
        }
      }
    }
  });
});
