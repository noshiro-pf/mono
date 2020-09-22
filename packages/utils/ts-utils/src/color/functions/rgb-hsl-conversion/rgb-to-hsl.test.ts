import { testColors, testHslEquality } from '../basic-conversion';
import { rgbToHsl } from './rgb-to-hsl';

for (const [index, testColor] of testColors.entries()) {
  testHslEquality(
    `rgbToHsl test No. ${index}`,
    testColor.hsl,
    rgbToHsl(testColor.rgb)
  );
}
