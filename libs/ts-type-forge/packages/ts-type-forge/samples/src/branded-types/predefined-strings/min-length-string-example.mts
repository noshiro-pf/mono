import { type MinLengthString, type SupportedLength } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isMinLengthString = <N extends SupportedLength>(
  s: string,
  minLength: N,
): s is MinLengthString<N> => s.length >= minLength;

const password = 'very-secret-password' as MinLengthString<12>;

const nonEmpty: MinLengthString<1> = password; // OK (12 >= 1)
// const longer: MinLengthString<16> = password; // Error! (12 < 16)

// embed-sample-code-ignore-below
export { isMinLengthString, nonEmpty };
