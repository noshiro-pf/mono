import { type NonPositiveInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveInt32 = (x: number): x is NonPositiveInt32 =>
  Number.isSafeInteger(x) && -(2 ** 31) <= x && x <= 0;

const temperatureDelta = (drop: NonPositiveInt32) => ({ drop });

// embed-sample-code-ignore-below
export { isNonPositiveInt32, temperatureDelta };
