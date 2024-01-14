import { testColors, testHslEquality } from '../basic-conversion/index.mjs';
import { rgbToHsl } from './rgb-to-hsl.mjs';

for (const [index, testColor] of testColors.entries()) {
  testHslEquality(
    `rgbToHsl test No. ${index}`,
    testColor.hsl,
    rgbToHsl(testColor.rgb),
  );
}
