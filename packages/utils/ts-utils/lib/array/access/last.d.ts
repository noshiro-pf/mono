import { ReadonlyNonEmptyArray } from '../non-empty-array';
interface Last {
    <T>(array: ReadonlyNonEmptyArray<T>): T;
    <T>(array: readonly T[]): T | undefined;
}
export declare const last: Last;
export {};
//# sourceMappingURL=last.d.ts.map