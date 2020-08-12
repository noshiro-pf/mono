import { RN } from './abstract_class';
export declare type Operator<A, B> = (src: RN<A>) => RN<B>;
export declare type Subscriber<A> = {
    next: (v: A) => void;
    error: (e?: any) => void;
    complete: () => void;
};
export declare type Subscription = {
    unsubscribe: () => void;
};
export declare type ArrayElement<S> = S extends Array<infer T> ? T : never;
export declare type RNValue<A> = A extends RN<infer B> ? B : never;
export declare type Unwrap<A> = {
    [P in keyof A]: RNValue<A[P]>;
};
export declare type RNType = 'base' | 'source' | 'sync child' | 'async child' | 'merge';
export declare type Subscribable<A> = {
    subscribe(next: (v: A) => void, error?: (e?: any) => void, complete?: () => void): Subscription;
};
export declare type TimerId = any;
//# sourceMappingURL=types.d.ts.map