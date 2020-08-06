import { Operator } from '../types/Operator';
export declare const map: <T, U>(fn: (srcValue: T, srcIndex: number, index: number) => U, name?: string) => Operator<T, U>;
export declare const mapTo: <T, U>(value: U, name?: string) => Operator<T, U>;
export declare const valueIs: <T>(value: T, name?: string) => Operator<T, boolean>;
export declare const valueIsNot: <T>(value: T, name?: string) => Operator<T, boolean>;
export declare const pluck: <T, K extends keyof T>(member: K, name?: string) => Operator<T, T[K]>;
export declare const withTimestamp: <T>(name?: string) => Operator<T, [T, number]>;
//# sourceMappingURL=map.d.ts.map