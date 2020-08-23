import { ArrayElement } from '../../types';
declare type Unwrap<S> = {
    [P in keyof S]: ArrayElement<S[P]>;
};
export declare function zip<T extends [ReadonlyArray<unknown>, ReadonlyArray<unknown>, ...(readonly ReadonlyArray<unknown>[])]>(...arrays: T): Unwrap<T>[];
export {};
//# sourceMappingURL=zip.d.ts.map