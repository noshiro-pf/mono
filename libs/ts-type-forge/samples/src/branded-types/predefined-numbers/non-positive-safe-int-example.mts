import { type NonPositiveSafeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveSafeInt = (x: number): x is NonPositiveSafeInt =>
  Number.isSafeInteger(x) && x <= 0;

const debt = (amount: NonPositiveSafeInt) => ({ debt: amount });

// embed-sample-code-ignore-below
export { debt, isNonPositiveSafeInt };
