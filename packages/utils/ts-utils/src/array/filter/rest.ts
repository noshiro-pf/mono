import type { TypeEq } from '../../types';
import { assertType } from '../../types';

type Rest<A extends readonly unknown[]> = A['length'] extends 0
  ? []
  : A extends readonly [unknown, ...infer R]
  ? R
  : A;

export const rest = <A extends readonly unknown[]>(r: A): Rest<A> =>
  r.slice(1) as Rest<A>;

{
  const a = [1, 2, 3] as const;
  const r = rest(a);
  assertType<TypeEq<typeof r, [2, 3]>>();
}

{
  const a = [] as const;
  const r = rest(a);
  assertType<TypeEq<typeof r, []>>();
}

{
  const a: number[] = [];
  const r = rest(a);
  assertType<TypeEq<typeof r, number[]>>();
}
