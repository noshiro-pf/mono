import { testColors } from './color-test-values.mjs';
import { testRgbEquality } from './helper-functions/index.mjs';
import { hexToRgb } from './hex-to-rgb.mjs';

for (const [index, testColor] of testColors.entries()) {
  testRgbEquality(
    `hexToRgb test No. ${index}`,
    testColor.rgb,
    hexToRgb(testColor.HEX),
  );
}
