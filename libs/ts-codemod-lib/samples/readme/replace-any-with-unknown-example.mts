/* eslint-disable import-x/unambiguous, vitest/expect-expect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion */
// embed-sample-code-ignore-above
// Before
const getValue = (data: any): any => data.value;

const sortValues = (...args: any): any =>
  args.toSorted((a: any, b: any) => a - b);

// After
const getValue2 = (data: unknown): unknown => (data as any).value;

const sortValues2 = (...args: readonly unknown[]): unknown =>
  (args as any).toSorted((a: any, b: any) => a - b);

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('replace-any-with-unknown-example', () => {
    getValue satisfies (data: any) => any;

    sortValues satisfies (...args: any) => any;

    getValue2 satisfies (data: unknown) => unknown;

    sortValues2 satisfies (...args: readonly unknown[]) => unknown;
  });
}
