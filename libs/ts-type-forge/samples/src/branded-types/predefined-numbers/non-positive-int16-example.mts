import { type NonPositiveInt16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveInt16 = (x: number): x is NonPositiveInt16 =>
  Number.isSafeInteger(x) && x <= 0 && x >= -(2 ** 15);

const relativeFloor = (level: NonPositiveInt16) => ({ level }) as const;

// embed-sample-code-ignore-below
export { isNonPositiveInt16, relativeFloor };
