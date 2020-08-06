import { Operator } from '../types/Operator';
export declare const skip: <T>(initialValue: T, skipNum: number, name?: string) => Operator<T, T>;
export declare const skipWhile: <T>(initialValue: T, predicate: (srcValue: T, srcIndex: number, index: number) => boolean, name?: string) => Operator<T, T>;
//# sourceMappingURL=skip.d.ts.map