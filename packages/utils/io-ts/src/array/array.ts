import { IList } from '@noshiro/ts-utils';
import type { Type } from '../type';

export const array = <A, D extends A>({
  elementType,
  defaultValue = [],
}: Readonly<{ elementType: Type<A, D>; defaultValue?: readonly A[] }>): Type<
  readonly A[],
  readonly A[]
> => {
  const is = (a: unknown): a is readonly A[] =>
    IList.isArray(a) && IList.every(a, (e) => elementType.is(e));

  const fill = (a: unknown): readonly A[] =>
    IList.isArray(a) ? IList.map(a, (e) => elementType.fill(e)) : defaultValue;

  return { defaultValue, is, fill };
};
