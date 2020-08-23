export declare type Cons<X, XS extends any[]> = ((h: X, ...args: XS) => void) extends (...args: infer R) => void ? R : [];
//# sourceMappingURL=cons.d.ts.map