/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const xs: readonly number[] = [1, 2, 3];

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const pair: readonly [number, string] = [1, 'a'];

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const rec: ReadonlyRecord<string, number> = { a: 1 };

// Before (with `noUncheckedIndexedAccess` on, only `pair[1]` is known to be there)
const first: number | undefined = xs[0];

const entry: number | undefined = rec['a'];

const second: string = pair[1];

// After (the two unchecked reads are asserted, the guaranteed index is left alone)
const first2: number = xs[0]!;

const entry2: number = rec['a']!;

const second2: string = pair[1];

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('enable-no-unchecked-indexed-access-example', () => {
    first satisfies number | undefined;

    entry satisfies number | undefined;

    second satisfies string;

    first2 satisfies number;

    entry2 satisfies number;

    second2 satisfies string;

    expectType<typeof first, number | undefined>('=');

    expectType<typeof entry, number | undefined>('=');

    expectType<typeof first2, number>('=');

    expectType<typeof entry2, number>('=');
  });
}
