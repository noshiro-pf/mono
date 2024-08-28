import { keyIsIn } from '../guard/index.mjs';

/** @internal */
export type _IsLiteralType<T extends RecordKeyType> = string extends T
  ? false
  : number extends T
    ? false
    : symbol extends T
      ? false
      : true;

export function match<const Case extends RecordKeyType, const V>(
  target: Case,
  cases: Record<Case, V>,
): _IsLiteralType<Case> extends true ? V : V | undefined;

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
