import { seq } from '../array';
import { Hsl, Hue } from './types';

export const whiteHsl: Hsl = [0, 0, 100];
export const blackHsl: Hsl = [0, 0, 0];

export const transparent = 'transparent';

// color keywords

export const [
  redHue,
  orangeHue,
  yellowHue,
  greenyellowHue,
  limeHue,
  springgreenHue,
  aquaHue,
  skyblueHue,
  blueHue,
  purpleHue,
  magentaHue, // fuchsia
  roseHue,
]: readonly Hue[] = seq(12).map((i) => (i * 30) as Hue);
