import { type NonPositiveInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonPositiveInt = (x: number): x is NonPositiveInt =>
  Number.isInteger(x) && x <= 0;

const countdown = (remaining: NonPositiveInt) => ({ remaining }) as const;
const penalty = (points: NonPositiveInt) => ({ penalty: points }) as const;

// embed-sample-code-ignore-below
export { countdown, isNonPositiveInt, penalty };
