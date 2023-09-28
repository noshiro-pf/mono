import { Arr } from '@noshiro/ts-utils';
import { toHue } from './to-hue';
import { type Hsl, type Hue } from './types';

export const whiteHsl: Hsl = [0, 0, 100];
export const blackHsl: Hsl = [0, 0, 0];

export const transparent = 'transparent';

// color keywords

export const [
  redHue,
  orangeHue,
  yellowHue,
  greenYellowHue,
  limeHue,
  springGreenHue,
  aquaHue,
  skyBlueHue,
  blueHue,
  purpleHue,
  magentaHue, // fuchsia
  roseHue,
]: readonly Hue[] = Arr.seq(12).map((i) => toHue(i * 30));
