import { ReducerType } from '../../types';
import { newArray } from '../create/new-array';
import { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

export const scan = <A, B>(reducer: ReducerType<B, A>, init: B) => (
  array: ReadonlyNonEmptyArray<A> | readonly A[]
): NonEmptyArray<B> => {
  const result: B[] = newArray<B>(array.length + 1, init);

  let acc = init;
  for (const [index, value] of array.entries()) {
    acc = reducer(acc, value);
    result[index + 1] = acc;
  }

  return (result as unknown) as NonEmptyArray<B>;
};
