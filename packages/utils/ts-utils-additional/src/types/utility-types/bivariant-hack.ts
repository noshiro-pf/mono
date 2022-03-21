import { assertType } from '@noshiro/ts-utils';

/* eslint-disable functional/no-method-signature */

export type Bivariant<F extends (...args: readonly never[]) => unknown> = {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  bivariantHack(...args: Parameters<F>): ReturnType<F>;
}['bivariantHack'];

assertType<TypeEq<Bivariant<(a: number) => string>, (a: number) => string>>();

assertType<
  TypeEq<
    Bivariant<(a: number, b: string) => string>,
    (a: number, b: string) => string
  >
>();
