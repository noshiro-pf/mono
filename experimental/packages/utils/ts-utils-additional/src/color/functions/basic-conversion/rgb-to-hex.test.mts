import { testColors } from './color-test-values.mjs';
import { rgbToHex } from './rgb-to-hex.mjs';

describe.each(Array.from(testColors.entries()))(
  'rgbToHex',
  (index, testColor) => {
    test(`rgbToHex test No. ${index}`, () => {
      expect(testColor.HEX).toBe(rgbToHex(testColor.rgb));
    });
  },
);
