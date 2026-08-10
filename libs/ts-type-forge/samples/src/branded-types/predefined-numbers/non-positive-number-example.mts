import { type NonPositiveNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositive = (x: number): x is NonPositiveNumber => x <= 0;

const clampToNonPositive = (x: number): NonPositiveNumber =>
  Math.min(x, 0) as NonPositiveNumber;

const debt = (amount: NonPositiveNumber) => ({ debtOrZero: amount });

// embed-sample-code-ignore-below
export { clampToNonPositive, debt, isNonPositive };
