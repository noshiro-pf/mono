import { labelInk, relativeLuminance } from './label-color.mjs';

describe(labelInk, () => {
  test.each([
    ['ffffff', '#000'],
    ['000000', '#fff'],
    ['d73a4a', '#000'],
    ['0075ca', '#fff'],
    ['a2eeef', '#000'],
    ['ededed', '#000'],
    ['fbca04', '#000'],
  ] as const)('%s takes %s', (hex, ink) => {
    assert.strictEqual(labelInk(hex), ink);
  });

  test.each([
    'd73a4a',
    '0075ca',
    'cfd3d7',
    'a2eeef',
    '7057ff',
    '008672',
    'e4e669',
    'd876e3',
    'ffffff',
  ])('reaches 4.5:1 on the default GitHub label %s', (hex) => {
    const l = relativeLuminance(hex);

    // Contrast (lighter + 0.05) / (darker + 0.05) ≥ 4.5, multiplied out.
    assert.isTrue(
      labelInk(hex) === '#000'
        ? l + 0.05 >= 4.5 * 0.05
        : 1.05 >= 4.5 * (l + 0.05),
    );
  });
});
