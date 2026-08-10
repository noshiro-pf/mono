/* eslint-disable functional/prefer-property-signatures */

type BivariantHack<F extends (...args: readonly never[]) => unknown> = {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  bivariantHack(...args: Parameters<F>): ReturnType<F>;
}['bivariantHack'];
