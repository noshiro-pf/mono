import { clamp, roundToInt } from '../../../num';
import { Hue } from '../../types';

const clamp359 = clamp(0, 359) as (x: number) => Hue;

export const numberToHue = (x: number): Hue => clamp359(roundToInt(x));
