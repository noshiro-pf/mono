/// <reference types="ts-type-forge/global" />

import { type TypeEq } from 'ts-type-forge';

// ts-type-forge publishes types only, so its check is a compile, not a run.
// `tsc --noEmit` failing on any of these is the assertion.

const expectTrue = <_T extends true>(): void => undefined;

expectTrue<TypeEq<StrictOmit<{ a: 1; b: 2 }, 'b'>, { a: 1 }>>();

expectTrue<
  TypeEq<
    DeepReadonly<{ a: { b: number[] } }>,
    { readonly a: { readonly b: readonly number[] } }
  >
>();

// The global types arrive from the `./global` entry, without an import.
const scores: ReadonlyRecord<string, number> = { a: 1 };

export const first: number = scores['a'] ?? 0;
