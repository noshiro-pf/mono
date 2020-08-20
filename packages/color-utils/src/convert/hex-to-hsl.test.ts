import { testColors, testHslEquality } from 'noshiro-ts-utils';
import { hexToHsl } from './hex-to-hsl';

for (const [index, testColor] of testColors.entries()) {
  testHslEquality(
    `hexToHsl test No. ${index}`,
    testColor.hsl,
    hexToHsl(testColor.HEX)
  );
}
