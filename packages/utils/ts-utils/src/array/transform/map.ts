import { FunctionType } from '../../types/utility-types/function';
import { ReadonlyNonEmptyArray } from '../non-empty-array';

export const neaMap = <A, B>(mapFn: FunctionType<A, B>) => (
  array: ReadonlyNonEmptyArray<A>
): ReadonlyNonEmptyArray<B> =>
  (array.map(mapFn) as unknown) as ReadonlyNonEmptyArray<B>;

interface Overload<A, B> {
  (array: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B>;
  (array: readonly A[]): B[];
}
export const map = <A, B>(mapFn: FunctionType<A, B>): Overload<A, B> =>
  ((array: readonly A[]): B[] => array.map(mapFn)) as Overload<A, B>;
