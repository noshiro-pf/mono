import { type MaxLengthArray, type SupportedLength } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isMaxLengthArray = <N extends SupportedLength, E>(
  xs: readonly E[],
  maxLength: N,
): xs is MaxLengthArray<N, E> => xs.length <= maxLength;

const tags = ['a', 'b', 'c'] as unknown as MaxLengthArray<8, string>;

const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
const widened: readonly string[] = tags; // OK
// const strict: MaxLengthArray<2, string> = tags; // Error! (8 > 2)

// embed-sample-code-ignore-below
export { isMaxLengthArray, relaxed, widened };
