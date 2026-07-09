import { type PositiveInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveInt = (x: number): x is PositiveInt =>
  Number.isInteger(x) && x > 0;

const take = <T,>(arr: readonly T[], n: PositiveInt): T[] => arr.slice(0, n);

const id = (value: PositiveInt) => ({ id: value });

// embed-sample-code-ignore-below
export { id, isPositiveInt, take };
