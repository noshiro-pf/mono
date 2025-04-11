import { expectType } from '../expect-type.mjs';
import { keyIsIn } from '../guard/index.mjs';

/** @internal */
type IsLiteralTypeImpl<T extends RecordKeyType> = string extends T
  ? false
  : number extends T
    ? false
    : symbol extends T
      ? false
      : true;

type StrictPropertyCheck<T, ExpectedKeys extends string> =
  RelaxedExclude<keyof T, ExpectedKeys> extends never ? T : never;

export const strictMatch = <
  const Case extends string,
  const R extends Record<Case, unknown>,
>(
  target: Case,
  cases: StrictPropertyCheck<R, Case>,
): R[Case] => cases[target];

export function match<const Case extends RecordKeyType, const V>(
  target: Case,
  cases: Record<Case, V>,
): IsLiteralTypeImpl<Case> extends true ? V : V | undefined;

export function match<
  const Case extends RecordKeyType,
  const V,
  const CaseSub extends Case,
>(target: Case, cases: Record<CaseSub, V>): V;

export function match<
  const Case extends RecordKeyType,
  const V,
  const CaseSub extends Case,
>(target: Case, cases: Record<CaseSub, V>): V | undefined {
  return keyIsIn(target, cases) ? cases[target] : undefined;
}

if (import.meta.vitest !== undefined) {
  expectType<IsLiteralTypeImpl<'aaa'>, true>('=');
  expectType<IsLiteralTypeImpl<33>, true>('=');
  expectType<IsLiteralTypeImpl<number | 'aa'>, false>('=');
  expectType<IsLiteralTypeImpl<'aa' | 32>, true>('=');

  test('dummy', () => {
    expect(true).toBe(true);
  });
}
