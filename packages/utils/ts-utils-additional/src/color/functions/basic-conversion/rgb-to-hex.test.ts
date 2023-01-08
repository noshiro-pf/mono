import { Arr } from '@noshiro/ts-utils';
import { testColors } from './color-test-values';
import { rgbToHex } from './rgb-to-hex';

describe.each(Arr.from(testColors.entries()))(
  'rgbToHex',
  (index, testColor) => {
    test(`rgbToHex test No. ${index}`, () => {
      expect(testColor.HEX).toBe(rgbToHex(testColor.rgb));
    });
  }
);
