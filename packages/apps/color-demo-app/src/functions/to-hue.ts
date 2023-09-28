import { type Hue } from '@noshiro/ts-utils-additional';

const isHue = (a: number): a is Hue =>
  Number.isSafeInteger(a) && a >= 0 && a < 360;

export const toHue = (a: number): Hue => {
  if (isHue(a)) return a;
  throw new Error(`toHue: ${a} is not a value of type "Hue".`);
};
