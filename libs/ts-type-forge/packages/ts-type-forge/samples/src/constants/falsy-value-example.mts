import { type FalsyValue } from 'ts-type-forge';

// embed-sample-code-ignore-above

const checkFalsy = (value: unknown): value is FalsyValue => !value;

checkFalsy(false); // true
checkFalsy(0); // true
checkFalsy(''); // true
checkFalsy(null); // true
checkFalsy(undefined); // true
checkFalsy('hello'); // false
checkFalsy(1); // false

// Type guard for filtering out falsy values
const truthyValues = [0, 1, '', 'hello', false, true, null].filter(
  (value): value is Exclude<typeof value, FalsyValue> => Boolean(value),
); // [1, 'hello', true]

// Conditional logic based on falsy values
type IsFalsy<T> = T extends FalsyValue ? true : false;
type Test1 = IsFalsy<0>; // true
type Test2 = IsFalsy<'hi'>; // false

// embed-sample-code-ignore-below
export { checkFalsy, truthyValues };
export type { IsFalsy, Test1, Test2 };
