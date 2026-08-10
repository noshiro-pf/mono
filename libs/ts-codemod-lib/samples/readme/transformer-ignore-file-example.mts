/* transformer-ignore */
// This entire file will not be processed by transformers.

/* eslint-disable @typescript-eslint/no-explicit-any, vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
type Data = { value: any };

const items = [1, 2, 3];

// After applying any transformer (e.g., replaceAnyWithUnknownTransformer, appendAsConstTransformer)
// No changes will be made to this file.
type Data2 = { value: any };

const items2 = [1, 2, 3];

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('transformer-ignore-file-example', () => {
    expectType<Data, { value: any }>('=');

    expectType<Data2, { value: any }>('=');

    items satisfies readonly number[];

    items2 satisfies readonly number[];
  });
}
