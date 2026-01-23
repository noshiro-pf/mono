/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
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

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('convert-to-readonly-example', () => {
    expectType<
      User,
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
  });
}
