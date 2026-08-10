import { type NonPositiveFiniteNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveFinite = (x: number): x is NonPositiveFiniteNumber =>
  Number.isFinite(x) && x <= 0;

const debt = (amount: NonPositiveFiniteNumber) => ({ debt: amount });

// embed-sample-code-ignore-below
export { debt, isNonPositiveFinite };
