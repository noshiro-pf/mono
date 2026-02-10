/* eslint-disable import-x/unambiguous, vitest/expect-expect */
// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const arr = [1, 2, 3];

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const obj = { a: 1, b: 2 };

// After
const arr2 = [1, 2, 3] as const;

const obj2 = { a: 1, b: 2 } as const;

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('append-as-const-example', () => {
    arr satisfies readonly number[];

    obj satisfies Readonly<{ a: number; b: number }>;

    arr2 satisfies readonly [1, 2, 3];

    obj2 satisfies Readonly<{ a: 1; b: 2 }>;
  });
}
