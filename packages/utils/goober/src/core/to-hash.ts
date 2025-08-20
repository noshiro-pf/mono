/**
 * Transforms the input into a className.
 * The multiplication constant 101 is selected to be a prime,
 * as is the initial value of 11.
 * The intermediate and final results are truncated into 32-bit
 * unsigned integers.
 */
export const toHash = (str: string): string =>
  `go${str
    .split('')
    .reduce((out, i) => (101 * out + i.charCodeAt(0)) >>> 0, 11)}`;
