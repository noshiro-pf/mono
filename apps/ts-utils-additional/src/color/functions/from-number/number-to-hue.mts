import { Num } from 'ts-data-forge';
import { type Hue } from '../../types/index.mjs';

const clamp = Num.clamp(0, 359);

export const numberToHue = (x: number): Hue =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  clamp(Num.roundToInt(x)) as Hue;
