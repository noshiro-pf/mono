export declare type TypeEq<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
export declare function assertType<_T extends true>(): void;
export declare function assertNotType<_T extends false>(): void;
//# sourceMappingURL=test-type.d.ts.map