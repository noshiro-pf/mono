import type { ReducerType, uint32 } from '../../types';
import { newArray } from '../create';
import type { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

export const scan =
  <A, B>(reducer: ReducerType<B, A>, init: B) =>
  (array: ReadonlyNonEmptyArray<A> | readonly A[]): NonEmptyArray<B> => {
    const result: B[] = newArray<B>((array.length + 1) as uint32, init);

    let acc = init;
    for (const [index, value] of array.entries()) {
      acc = reducer(acc, value);
      result[index + 1] = acc;
    }

    return result as NonEmptyArray<B>;
  };
