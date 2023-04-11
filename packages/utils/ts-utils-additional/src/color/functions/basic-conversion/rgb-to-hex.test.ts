import { testColors } from './color-test-values';
import { rgbToHex } from './rgb-to-hex';

describe.each(Array.from(testColors.entries()))(
  'rgbToHex',
  (index, testColor) => {
    test(`rgbToHex test No. ${index}`, () => {
      expect(testColor.HEX).toBe(rgbToHex(testColor.rgb));
    });
  }
);
