import { ReadonlyNonEmptyArray } from '../non-empty-array';
interface UniqType {
    <T>(arr: ReadonlyNonEmptyArray<T>): ReadonlyNonEmptyArray<T>;
    <T>(arr: readonly T[]): T[];
}
/**
 * @desc copy and return unique array
 * @param arr target array
 * @param mapFn perform identity check after mapping by the map function
 */
export declare const uniq: UniqType;
interface UniqByType<A> {
    (arr: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A>;
    (arr: readonly A[]): A[];
}
export declare const uniqBy: <A, B>(mapFn: (value: A) => B) => UniqByType<A>;
export {};
//# sourceMappingURL=uniq.d.ts.map