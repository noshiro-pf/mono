import { assertType } from '../assert-type';
import { hasKey } from '../validator';

export function match<Case extends RecordKeyType, V>(
  switchCase: Case,
  cases: ReadonlyRecord<Case, V>
): V;
export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: ReadonlyRecord<CaseSub, V>,
  defaultCase: V
): V;
export function match<Case extends RecordKeyType, V, CaseSub extends Case>(
  switchCase: Case,
  cases: ReadonlyRecord<CaseSub, V>,
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

const res2 = match(
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
assertType<TypeEq<typeof res2, number>>();
