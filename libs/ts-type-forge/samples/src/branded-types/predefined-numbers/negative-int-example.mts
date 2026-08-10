import { type NegativeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeInt = (x: number): x is NegativeInt =>
  Number.isInteger(x) && x < 0;

const offset = (value: NegativeInt) => ({ offset: value }) as const;
const depth = (level: NegativeInt) =>
  ({ belowGround: Math.abs(level) }) as const;

// embed-sample-code-ignore-below
export { depth, isNegativeInt, offset };
