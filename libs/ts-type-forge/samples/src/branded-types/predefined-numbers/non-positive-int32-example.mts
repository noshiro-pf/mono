import { type NonPositiveInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveInt32 = (x: number): x is NonPositiveInt32 =>
  Number.isSafeInteger(x) && x <= 0 && x >= -(2 ** 31);

const temperatureDelta = (drop: NonPositiveInt32) => ({ drop }) as const;

// embed-sample-code-ignore-below
export { isNonPositiveInt32, temperatureDelta };
