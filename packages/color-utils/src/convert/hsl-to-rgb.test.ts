import { testColors, testRgbEquality } from '@mono/ts-utils';
import { hslToRgb } from './hsl-to-rgb';

for (const [index, testColor] of testColors.entries()) {
  testRgbEquality(
    `hslToRgb test No. ${index}`,
    testColor.rgb,
    hslToRgb(testColor.hsl)
  );
}
