import { RN } from './RN';
export declare type RNValue<S> = S extends RN<infer T> ? T : never;
export declare type ArrayElement<S> = S extends Array<infer T> ? T : never;
export declare type Unwrap<S> = {
    [P in keyof S]: RNValue<S[P]>;
};
export declare const unwrapCurr: <T extends RN<any>[]>(...rns: T) => Unwrap<T>;
export declare const noop: () => void;
//# sourceMappingURL=utils.d.ts.map