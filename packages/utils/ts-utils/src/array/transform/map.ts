import { FunctionType } from '../../types/utility-types/function';
import { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

export const neaMap = <A, B>(mapFn: FunctionType<A, B>) => (
  array: ReadonlyNonEmptyArray<A>
): NonEmptyArray<B> => (array.map(mapFn) as unknown) as NonEmptyArray<B>;

export const map = <A, B>(mapFn: FunctionType<A, B>) => (
  array: readonly A[]
): B[] => array.map(mapFn);

export const neaMapWithIndex = <A, B>(mapFn: (a: A, index: number) => B) => (
  array: ReadonlyNonEmptyArray<A>
): NonEmptyArray<B> => array.map(mapFn) as NonEmptyArray<B>;

export const mapWithIndex = <A, B>(mapFn: (a: A, index: number) => B) => (
  array: readonly A[]
): B[] => array.map(mapFn);
