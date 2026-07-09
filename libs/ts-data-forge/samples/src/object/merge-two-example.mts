/* transformer-ignore convert-to-readonly */
/* eslint-disable vitest/expect-expect */
// Example: src/object/object.mts (MergeTwo)
import { expectType } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';

// Local duplicate of the internal (non-exported) `Obj.MergeTwo` type, kept here
// only so this sample compiles. It is declared above the embed markers, so it
// is NOT part of the embedded JSDoc snippet (only the code between the markers
// below is embedded). Keep this in sync with `Obj.MergeTwo` in
// `src/object/object.mts`.
type MergeTwo<A extends UnknownRecord, B extends UnknownRecord> = {
  // 1. Required properties from B (override A completely)
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  readonly [K in keyof B as {} extends Pick<B, K> ? never : K]: B[K];
} & {
  // 2. Optional properties from B that are NOT in A
  readonly [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    K in keyof B as {} extends Pick<B, K>
      ? K extends keyof A
        ? never
        : K
      : never
  ]?: B[K];
} & {
  // 3. Optional properties from B that ARE in A (create union)
  readonly [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    K in keyof B as {} extends Pick<B, K>
      ? K extends keyof A
        ? K
        : never
      : never
  ]?: K extends keyof A ? A[K] | B[K] : never;
} & {
  // 4. Required properties only in A (not overridden by B)
  readonly [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    K in Exclude<keyof A, keyof B> as {} extends Pick<A, K> ? never : K
  ]: A[K];
} & {
  // 5. Optional properties only in A (not overridden by B)
  readonly [
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    K in Exclude<keyof A, keyof B> as {} extends Pick<A, K> ? K : never
  ]?: A[K];
} extends infer O
  ? Readonly<
      {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        [K in keyof O as {} extends Pick<O, K> ? never : K]: O[K];
      } & {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        [K in keyof O as {} extends Pick<O, K> ? K : never]?: O[K];
      }
    >
  : never;

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type A = Readonly<{ x: number; y?: string }>;

    type B = Readonly<{ y?: number; z?: boolean }>;

    type Result = MergeTwo<A, B>;
    // Result: Readonly<{ x: number; y?: string | number; z?: boolean }>
    // embed-sample-code-ignore-below

    expectType<
      Result,
      Readonly<{
        x: number;
        y?: string | number;
        z?: boolean;
      }>
    >('=');
  });
}
