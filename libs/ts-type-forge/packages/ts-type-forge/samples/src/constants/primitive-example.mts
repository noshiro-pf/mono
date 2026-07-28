import { type Primitive } from 'ts-type-forge';

// embed-sample-code-ignore-above

type P1 = Primitive; // bigint | boolean | number | string | symbol | null | undefined

const checkPrimitive = (value: unknown): value is Primitive =>
  value !== Object(value);

checkPrimitive(42); // true (number)
checkPrimitive('hello'); // true (string)
checkPrimitive(true); // true (boolean)
checkPrimitive(null); // true (null)
checkPrimitive({}); // false (object)
checkPrimitive([]); // false (array/object)

// embed-sample-code-ignore-below
export { checkPrimitive };
export type { P1 };
