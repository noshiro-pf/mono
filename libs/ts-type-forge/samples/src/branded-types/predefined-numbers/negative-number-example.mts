import { type NegativeNumber, type PositiveNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegative = (x: number): x is NegativeNumber => x < 0;

const absoluteValue = (x: NegativeNumber): PositiveNumber =>
  Math.abs(x) as PositiveNumber;

const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });

// embed-sample-code-ignore-below
export { absoluteValue, debt, isNegative };
