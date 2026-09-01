import { Num, Uint8 } from 'ts-data-forge';
import { type RgbValue } from '../../types/index.mjs';

export const numberToRgbValue = (x: number): RgbValue =>
  Uint8.fromNumber(Num.roundToInt(x));
