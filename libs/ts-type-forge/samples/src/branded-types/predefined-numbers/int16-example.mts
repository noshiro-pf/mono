import { type Int16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isInt16 = (x: number): x is Int16 =>
  Number.isSafeInteger(x) && -(2 ** 15) <= x && x <= 2 ** 15 - 1;

const audioSample = (value: Int16) => ({ sample: value });
const temperature = (celsius: Int16) => ({ celsius });

// embed-sample-code-ignore-below
export { audioSample, isInt16, temperature };
