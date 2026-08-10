import { type MinLengthArray, type SupportedLength } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isMinLengthArray = <N extends SupportedLength, E>(
  minLength: N,
  xs: readonly E[],
): xs is MinLengthArray<N, E> => xs.length >= minLength;

const history = [0, 1, 2, 3] as unknown as MinLengthArray<3, number>;

const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
const first: number = history[0]; // OK — no `undefined` below min(N, 10)
// const longer: MinLengthArray<5, number> = history; // Error! (3 < 5)

// embed-sample-code-ignore-below
export { first, isMinLengthArray, nonEmpty };
