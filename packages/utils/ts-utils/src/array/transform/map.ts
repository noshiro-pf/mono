import { FunctionType } from '../../types/utility-types/function';
import { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

export const neaMap = <A, B>(mapFn: FunctionType<A, B>) => (
  array: ReadonlyNonEmptyArray<A>
): NonEmptyArray<B> => (array.map(mapFn) as unknown) as NonEmptyArray<B>;

interface Overload<A, B> {
  (array: ReadonlyNonEmptyArray<A>): NonEmptyArray<B>;
  (array: readonly A[]): B[];
}

export const map = <A, B>(mapFn: FunctionType<A, B>): Overload<A, B> =>
  ((array: readonly A[]): B[] => array.map(mapFn)) as Overload<A, B>;

export const mapWithIndex = <A, B>(
  mapFn: (a: A, index: number) => B
): Overload<A, B> =>
  ((array: readonly A[]): B[] => array.map(mapFn)) as Overload<A, B>;
