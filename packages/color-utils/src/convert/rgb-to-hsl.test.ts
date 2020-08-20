import { testColors, testHslEquality } from 'noshiro-ts-utils';
import { rgbToHsl } from './rgb-to-hsl';

for (const [index, testColor] of testColors.entries()) {
  testHslEquality(
    `rgbToHsl test No. ${index}`,
    testColor.hsl,
    rgbToHsl(testColor.rgb)
  );
}
