import { ReadonlyNonEmptyArray } from '../non-empty-array';
interface Max {
    (array: ReadonlyNonEmptyArray<number>): number;
    (array: readonly number[]): number | undefined;
}
export declare const max: Max;
export {};
//# sourceMappingURL=max.d.ts.map