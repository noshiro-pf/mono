import { testColors, testHslEquality } from '../basic-conversion/index.mjs';
import { hexToHsl } from './hex-to-hsl.mjs';

for (const [index, testColor] of testColors.entries()) {
  testHslEquality(
    `hexToHsl test No. ${index}`,
    testColor.hsl,
    hexToHsl(testColor.HEX),
  );
}
