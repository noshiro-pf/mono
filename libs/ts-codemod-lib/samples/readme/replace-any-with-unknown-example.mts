/* eslint-disable import-x/unambiguous, vitest/expect-expect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion */
// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown
const getValue = (data: any): any => data.value;

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown, convert-to-readonly
const sortValues = (...args: any): any =>
  args.toSorted((a: any, b: any) => a - b);

// After
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown
const getValue2 = (data: unknown): unknown => (data as any).value;

const sortValues2 = (...args: readonly unknown[]): unknown =>
  /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown
  (args as any).toSorted((a: any, b: any) => a - b);

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('replace-any-with-unknown-example', () => {
    /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown
    getValue satisfies (data: any) => any;

    /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-any-with-unknown
    sortValues satisfies (...args: any) => any;

    getValue2 satisfies (data: unknown) => unknown;

    sortValues2 satisfies (...args: readonly unknown[]) => unknown;
  });
}
