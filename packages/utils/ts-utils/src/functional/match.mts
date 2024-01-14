import { keyIsIn } from '../guard/index.mjs';

/**
 * @internal
 */
export type _IsLiteralType<T extends RecordKeyType> = string extends T
  ? false
  : number extends T
    ? false
    : symbol extends T
      ? false
      : true;

export function match<Case extends RecordKeyType, V>(
  switchCase: Case,
  cases: Record<Case, V>,
): _IsLiteralType<Case> extends true ? V : V | undefined;

export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: Record<CaseSub, V>,
  defaultCase: V,
): V;

export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: Record<CaseSub, V>,
  defaultCase?: V,
): V | undefined {
  return keyIsIn(switchCase, cases) ? cases[switchCase] : defaultCase;
}
