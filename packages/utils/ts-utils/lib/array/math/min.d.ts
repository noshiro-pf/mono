import { ReadonlyNonEmptyArray } from '../non-empty-array';
interface Min {
    (array: ReadonlyNonEmptyArray<number>): number;
    (array: readonly number[]): number | undefined;
}
export declare const min: Min;
export {};
//# sourceMappingURL=min.d.ts.map