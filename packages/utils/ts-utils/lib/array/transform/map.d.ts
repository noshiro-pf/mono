import { FunctionType } from '../../types/utility-types/function';
import { ReadonlyNonEmptyArray } from '../non-empty-array';
export declare const neaMap: <A, B>(mapFn: FunctionType<A, B>) => (array: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B>;
interface Overload<A, B> {
    (array: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<B>;
    (array: readonly A[]): B[];
}
export declare function map2<A, B>(mapFn: FunctionType<A, B>): (array: ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B>;
export declare function map2<A, B>(mapFn: FunctionType<A, B>): (array: readonly A[]) => B[];
export declare const map: <A, B>(mapFn: FunctionType<A, B>) => Overload<A, B>;
export {};
//# sourceMappingURL=map.d.ts.map