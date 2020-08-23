import { Operator } from '../types/Operator';
export declare const take: <T>(takeNum: number, name?: string) => Operator<T, T>;
export declare const takeWhile: <T>(predicate: (srcValue: T, srcIndex: number, index: number) => boolean, name?: string) => Operator<T, T>;
//# sourceMappingURL=take.d.ts.map