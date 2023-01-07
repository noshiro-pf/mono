import { assertType } from '../assert-type';
import { hasKey } from '../guard';

type IsLiteralType<T extends RecordKeyType> = string extends T
  ? false
  : number extends T
  ? false
  : symbol extends T
  ? false
  : true;

assertType<TypeEq<IsLiteralType<'aaa'>, true>>();
assertType<TypeEq<IsLiteralType<33>, true>>();
assertType<TypeEq<IsLiteralType<number | 'aa'>, false>>();
assertType<TypeEq<IsLiteralType<'aa' | 32>, true>>();

export function match<Case extends RecordKeyType, V>(
  switchCase: Case,
  cases: Record<Case, V>
): IsLiteralType<Case> extends true ? V : V | undefined;

export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: Record<CaseSub, V>,
  defaultCase: V
): V;

export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: Record<CaseSub, V>,
  defaultCase?: V
): V | undefined {
  return hasKey(cases, switchCase) ? cases[switchCase] : defaultCase;
}

type Direction = 'E' | 'N' | 'S' | 'W';
const direction: Direction = 'N';

const res = match(direction as Direction, {
  E: 2,
  N: 3,
  S: 4,
  W: 5,
});

const res2 = match('N' as string, {
  E: 2,
  N: 3,
  S: 4,
  W: 5,
});

const res3 = match(
  'N' as string,
  {
    E: 2,
    N: 3,
    S: 4,
    W: 5,
  },
  999
);

assertType<TypeEq<typeof res, number>>();
assertType<TypeEq<typeof res2, number | undefined>>();
assertType<TypeEq<typeof res3, number>>();
