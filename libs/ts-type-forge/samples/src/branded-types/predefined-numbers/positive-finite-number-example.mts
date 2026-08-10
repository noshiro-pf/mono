import { type PositiveFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveFinite = (x: number): x is PositiveFiniteNumber =>
  Number.isFinite(x) && x > 0;

const price = (amount: PositiveFiniteNumber) => ({ USD: amount });
const weight = (kg: PositiveFiniteNumber) => ({ kilograms: kg });

// embed-sample-code-ignore-below
export { isPositiveFinite, price, weight };
