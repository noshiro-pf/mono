import { type PositiveNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositive = (x: number): x is PositiveNumber => x > 0;

const log = (x: PositiveNumber) => Math.log(x);
// Safe logarithm without non-positive input

const scale = (value: number, factor: PositiveNumber) => value * factor;

// embed-sample-code-ignore-below
export { isPositive, log, scale };
