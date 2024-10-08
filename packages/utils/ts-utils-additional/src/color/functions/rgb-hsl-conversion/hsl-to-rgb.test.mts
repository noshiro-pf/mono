import { testColors, testRgbEquality } from '../basic-conversion/index.mjs';
import { hslToRgb } from './hsl-to-rgb.mjs';

for (const [index, testColor] of testColors.entries()) {
  testRgbEquality(
    `hslToRgb test No. ${index}`,
    testColor.rgb,
    hslToRgb(testColor.hsl),
  );
}
