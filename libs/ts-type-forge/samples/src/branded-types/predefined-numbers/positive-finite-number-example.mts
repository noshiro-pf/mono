import { type PositiveFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveFinite = (x: number): x is PositiveFiniteNumber =>
  Number.isFinite(x) && x > 0;

const price = (amount: PositiveFiniteNumber) => ({ USD: amount }) as const;
const weight = (kg: PositiveFiniteNumber) => ({ kilograms: kg }) as const;

// embed-sample-code-ignore-below
export { isPositiveFinite, price, weight };
