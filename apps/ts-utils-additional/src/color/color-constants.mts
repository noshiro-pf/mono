import { Arr } from 'ts-data-forge';
import { toHue } from './to-hue.mjs';
import { type Hsl, type Hue } from './types/index.mjs';

export const whiteHsl: Hsl = [0, 0, 100] as const;

export const blackHsl: Hsl = [0, 0, 0] as const;

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
