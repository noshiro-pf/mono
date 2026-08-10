import { type Int16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isInt16 = (x: number): x is Int16 =>
  Number.isSafeInteger(x) && x >= -(2 ** 15) && x <= 2 ** 15 - 1;

const audioSample = (value: Int16) => ({ sample: value }) as const;
const temperature = (celsius: Int16) => ({ celsius }) as const;

// embed-sample-code-ignore-below
export { audioSample, isInt16, temperature };
