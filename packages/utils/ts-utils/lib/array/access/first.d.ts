import { ReadonlyNonEmptyArray } from '../non-empty-array';
interface First {
    <T>(array: ReadonlyNonEmptyArray<T>): T;
    <T>(array: readonly T[]): T | undefined;
}
export declare const first: First;
export {};
//# sourceMappingURL=first.d.ts.map