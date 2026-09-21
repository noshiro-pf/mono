// cspell:ignore fbca bfdadc
import { asNonZeroFiniteNumber, Num } from 'ts-data-forge';
import { chipColors } from './label-color.mjs';

/**
 * WCAG 2.x contrast, written out here rather than imported, so that the
 * assertions below are about the colours the module picks and not about the
 * same arithmetic agreeing with itself.
 */
const contrast = (a: string, b: string): number => {
  const [lighter = 0, darker = 0] = [luminance(a), luminance(b)].toSorted(
    (x, y) => y - x,
  );

  const denominator = darker + 0.05;

  return Num.isNonZero(denominator)
    ? Num.div(lighter + 0.05, denominator)
    : Number.POSITIVE_INFINITY;
};

const luminance = (hex: string): number => {
  const digits = hex.replace('#', '');

  const at = (i: number): number =>
    channel(Number.parseInt(digits.slice(i, i + 2), 16));

  return 0.2126 * at(0) + 0.7152 * at(2) + 0.0722 * at(4);
};

const channel = (value: number): number => {
  const c = Num.div(value, asNonZeroFiniteNumber(255));

  return c <= 0.040_45
    ? Num.div(c, asNonZeroFiniteNumber(12.92))
    : Num.div(c + 0.055, asNonZeroFiniteNumber(1.055)) ** 2.4;
};

describe(chipColors, () => {
  test('puts dark ink on a light label and light ink on a dark one', () => {
    expect(chipColors('ededed').text).toBe('#000000');

    expect(chipColors('000000').text).toBe('#ffffff');
  });

  // GitHub's own rule is perceived brightness (the YIQ weighting), which
  // picks white for `#0e8a16` where the contrast ratio picks black — and
  // black on it measures 5.2:1 against white's 4.0:1. The measurement wins
  // here: the chip is 12px text, and the point of computing this at all is
  // not to reproduce a choice made before WCAG had a formula.
  test('picks by measured contrast, not by perceived brightness', () => {
    const chip = chipColors('0e8a16');

    expect(chip.text).toBe('#000000');

    assert.isTrue(
      contrast(chip.background, '#000000') >
        contrast(chip.background, '#ffffff'),
    );
  });

  test('clears 4.5:1 on every colour GitHub offers', () => {
    // GitHub's own label palette, which is what a colour here will be.
    const palette = [
      'b60205',
      'd93f0b',
      'fbca04',
      '0e8a16',
      '006b75',
      '1d76db',
      '0052cc',
      '5319e7',
      'e99695',
      'f9d0c4',
      'fef2c0',
      'c2e0c6',
      'bfdadc',
      'c5def5',
      'bfd4f2',
      'd4c5f9',
      'ededed',
      'ffffff',
      '000000',
    ] as const;

    for (const color of palette) {
      const chip = chipColors(color);

      assert.isTrue(contrast(chip.background, chip.text) >= 4.5);
    }
  });

  test('falls back rather than failing on a colour it was not given', () => {
    // A payload written before colours were carried sends the empty string,
    // and a page that threw for it would be a page nobody could open.
    expect(chipColors('').background).toBe('#ededed');

    expect(chipColors('nope').background).toBe('#ededed');
  });

  test('accepts the leading hash GitHub does not send', () => {
    assert.deepStrictEqual(chipColors('#0e8a16'), chipColors('0e8a16'));
  });
});
