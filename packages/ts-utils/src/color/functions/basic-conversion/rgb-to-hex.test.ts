import { testColors } from './color-test-values';
import { rgbToHex } from './rgb-to-hex';

for (const [index, testColor] of testColors.entries()) {
  test(`rgbToHex test No. ${index}`, () => {
    expect(testColor.HEX).toBe(rgbToHex(testColor.rgb));
  });
}
