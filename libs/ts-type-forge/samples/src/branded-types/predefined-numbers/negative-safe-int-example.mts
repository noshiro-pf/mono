import { type NegativeSafeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeSafeInt = (x: number): x is NegativeSafeInt =>
  Number.isSafeInteger(x) && x < 0;

const priority = (level: NegativeSafeInt) => ({ priority: Math.abs(level) });

// embed-sample-code-ignore-below
export { isNegativeSafeInt, priority };
