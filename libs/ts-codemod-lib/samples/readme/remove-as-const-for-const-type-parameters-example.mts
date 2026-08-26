/* eslint-disable import-x/unambiguous, vitest/expect-expect */
// embed-sample-code-ignore-above
const f = <const T,>(x: T): T => x;

// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line append-as-const
const a = f([1, 2] as const);

// After (the `const` type parameter already infers `readonly [1, 2]`)
const a2 = f([1, 2]);

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('remove-as-const-for-const-type-parameters-example', () => {
    a satisfies readonly [1, 2];

    a2 satisfies readonly [1, 2];
  });
}
