import { type PositiveSafeInt, type Uint16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveSafeInt = (x: number): x is PositiveSafeInt =>
  Number.isSafeInteger(x) && x > 0;

const userId = (id: PositiveSafeInt) => ({ userId: id });
const port = (num: PositiveSafeInt & Uint16) => ({ port: num });

// embed-sample-code-ignore-below
export { isPositiveSafeInt, port, userId };
