export declare type Rest<T extends any[]> = ((...x: T) => void) extends (x: any, ...xs: infer XS) => void ? XS : never;
//# sourceMappingURL=rest.d.ts.map