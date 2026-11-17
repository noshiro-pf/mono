import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before (`@typescript-eslint/explicit-function-return-type` reports both)
/* embed-sample-code-ignore-this-line */ // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const double = (x: number) => x * 2;

/* embed-sample-code-ignore-this-line */ // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const isString = (x: unknown) => typeof x === 'string';

// After (an inferred type predicate is kept a type predicate)
export const double2 = (x: number): number => x * 2;

export const isString2 = (x: unknown): x is string => typeof x === 'string';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('enable-explicit-function-return-type-example', () => {
    expectType<ReturnType<typeof double>, ReturnType<typeof double2>>('=');

    expect(double(2)).toBe(double2(2));

    expect(isString('a')).toBe(isString2('a'));
  });
}
