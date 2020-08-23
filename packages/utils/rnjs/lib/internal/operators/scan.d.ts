import { Operator } from '../types/Operator';
export declare const scan: <T, U>(initialValue: U, fn: (state: Readonly<U>, srcValue: T, srcIndex?: number | undefined, index?: number | undefined) => U, name?: string) => Operator<T, U>;
//# sourceMappingURL=scan.d.ts.map