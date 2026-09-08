/**
 * The panic error. Implemented in ts-std-forge since Sumi D-49 / D-53; this
 * re-export keeps the names importable from here. The boundary functions of
 * this package recognize a panic through `isPanicError`, which matches on a
 * mark rather than on a constructor, so a panic raised by either package is a
 * panic to both.
 */
export { createPanicError, isPanicError, type PanicError } from 'ts-std-forge';
