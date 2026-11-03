import { Arr, asPositiveUint32, asUint32 } from 'ts-data-forge';
import { toHue } from '../../to-hue.mjs';
import { pickupHighContrastHues } from './pickup-high-contrast-hues.mjs';

const percents = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

describe(pickupHighContrastHues, () => {
  test('returns undefined for n = 0', () => {
    expect(pickupHighContrastHues(asUint32(0), 50, 50)).toBeUndefined();
  });

  // The threshold after the n-th pick, `maxValue * n / n`, can round one ulp
  // below `maxValue`, which let the last accumulated value be picked as one hue
  // too many. Before the fix, 49 of these 1452 inputs returned n + 1 hues,
  // e.g. (n, saturation, lightness) = (3, 20, 80). One test per n keeps each
  // under the timeout when run with coverage.
  test.each(Array.from(Arr.range(1, 13)))(
    'returns exactly n hues (n = %i)',
    (n) => {
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
    },
  );

  // color-demo draws both distributions. With a copy of this function that
  // lacked the fix above, it showed n + 1 hues for these settings.
  test.each([
    { n: 3, saturation: 15, lightness: 25, useLog: false },
    { n: 14, saturation: 4, lightness: 93, useLog: true },
  ] as const)(
    'returns exactly n hues for the settings color-demo got wrong (%o)',
    ({ n, saturation, lightness, useLog }) => {
      expect(
        pickupHighContrastHues(n, saturation, lightness, 0, useLog),
      ).toHaveLength(n);
    },
  );

  test.each([false, true])(
    'returns exactly n hues for every first hue (useLog = %s)',
    (useLog) => {
      for (const firstHue of [0, 45, 90, 135, 180, 225, 270, 315]) {
        for (const lightness of percents) {
          const hues = pickupHighContrastHues(
            asPositiveUint32(5),
            50,
            lightness,
            toHue(firstHue),
            useLog,
          );

          expect(hues).toHaveLength(5);
        }
      }
    },
  );

  test('defaults to a first hue of 0 and the log distribution', () => {
    assert.deepStrictEqual(
      pickupHighContrastHues(4, 50, 50),
      pickupHighContrastHues(4, 50, 50, 0, true),
    );
  });

  // At this saturation and lightness the accumulation is 0 at x = 0 and
  // positive at x = 1, so the first pick is x = 1, the hue `1 - firstHue`.
  test.each([
    { firstHue: 0, firstPick: 1 },
    { firstHue: 1, firstPick: 0 },
    { firstHue: 90, firstPick: 271 },
  ] as const)(
    'returns hues, with hue 0 at x = firstHue (%o)',
    ({ firstHue, firstPick }) => {
      expect(pickupHighContrastHues(4, 50, 50, firstHue, false)[0]).toBe(
        firstPick,
      );
    },
  );
});
