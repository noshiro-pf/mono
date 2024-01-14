import { Num } from '@noshiro/ts-utils';
import { type Hue } from '../../types/index.mjs';

// eslint-disable-next-line no-restricted-syntax
const clamp359 = Num.clamp(0, 359) as (x: number) => Hue;

export const numberToHue = (x: number): Hue => clamp359(Num.roundToInt(x));
