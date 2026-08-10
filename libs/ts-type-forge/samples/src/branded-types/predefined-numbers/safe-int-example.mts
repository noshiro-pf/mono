import { type SafeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isSafeInt = (x: number): x is SafeInt => Number.isSafeInteger(x);

const safeMath = {
  add: (a: SafeInt, b: SafeInt): SafeInt | undefined => {
    const result = a + b;
    return isSafeInt(result) ? result : undefined;
  },
} as const;

// embed-sample-code-ignore-below
export { isSafeInt, safeMath };
