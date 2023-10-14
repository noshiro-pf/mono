import { testColors } from './color-test-values';
import { testRgbEquality } from './helper-functions';
import { hexToRgb } from './hex-to-rgb';

for (const [index, testColor] of testColors.entries()) {
  testRgbEquality(
    `hexToRgb test No. ${index}`,
    testColor.rgb,
    hexToRgb(testColor.HEX),
  );
}
