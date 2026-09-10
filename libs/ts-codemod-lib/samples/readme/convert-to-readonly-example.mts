/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
type User = {
  id: number;
  description: string;
  preferences: Map<string, string>;
  friendIds: number[];
  mut_items: string[]; // With ignorePrefixes: ['mut_']
};

// After
type User2 = Readonly<{
  id: number;
  description: string;
  preferences: ReadonlyMap<string, string>;
  friendIds: readonly number[];
  mut_items: string[]; // Not made readonly due to 'mut_' prefix
}>;

// A type literal that declares a call or construct signature is marked
// `readonly` member by member rather than wrapped, because `Readonly<T>` is a
// mapped type over `keyof T` and neither signature kind survives it.

// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
type Parse = {
  (input: string): string[];

  (input: string, strict: boolean): string[] | undefined;

  separators: string[];
};

// After (still callable; only the members inside it changed)
type Parse2 = {
  (input: string): readonly string[];

  (input: string, strict: boolean): readonly string[] | undefined;

  readonly separators: readonly string[];
};

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('convert-to-readonly-example', () => {
    expectType<
      User,
      /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
      {
        id: number;
        description: string;
        preferences: Map<string, string>;
        friendIds: number[];
        mut_items: string[];
      }
    >('=');

    expectType<
      User2,
      Readonly<{
        id: number;
        description: string;
        preferences: ReadonlyMap<string, string>;
        friendIds: readonly number[];
        mut_items: string[];
      }>
    >('=');

    // `Readonly<T>` maps over `keyof T`, which here is `'separators'` alone:
    // wrapping this literal would keep the property and drop both call
    // signatures, leaving a type that is no longer callable.
    expectType<keyof Parse, 'separators'>('=');

    expectType<
      Parse2,
      /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
      {
        (input: string): readonly string[];

        (input: string, strict: boolean): readonly string[] | undefined;

        readonly separators: readonly string[];
      }
    >('=');
  });
}
