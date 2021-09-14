import { IList } from '../immutable';
import type { Hsl, Hue } from './types';

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
]: readonly Hue[] = IList.seqThrow(12).map((i) => (i * 30) as Hue);
