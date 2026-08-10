import { type NegativeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeInt = (x: number): x is NegativeInt =>
  Number.isInteger(x) && x < 0;

const offset = (value: NegativeInt) => ({ offset: value });
const depth = (level: NegativeInt) => ({ belowGround: Math.abs(level) });

// embed-sample-code-ignore-below
export { depth, isNegativeInt, offset };
