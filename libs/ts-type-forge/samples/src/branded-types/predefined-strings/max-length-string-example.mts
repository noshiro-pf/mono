import { type MaxLengthString, type SupportedLength } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isMaxLengthString = <N extends SupportedLength>(
  s: string,
  maxLength: N,
): s is MaxLengthString<N> => s.length <= maxLength;

const userName = 'noshiro' as MaxLengthString<32>;

const short: MaxLengthString<64> = userName; // OK (32 <= 64)
// const tooLong: MaxLengthString<16> = userName; // Error! (32 > 16)

// embed-sample-code-ignore-below
export { isMaxLengthString, short };
