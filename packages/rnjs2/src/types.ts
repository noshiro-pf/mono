import { RN } from './abstract_class';

export type Operator<A, B> = (src: RN<A>) => RN<B>;

export type Subscriber<A> = {
  next: (v: A) => void;
  error: (e?: any) => void;
  complete: () => void;
};

export type Subscription = {
  unsubscribe: () => void;
};

export type ArrayElement<S> = S extends Array<infer T> ? T : never;

export type RNValue<A> = A extends RN<infer B> ? B : never;

export type Unwrap<A> = { [P in keyof A]: RNValue<A[P]> };

export type RNType = 'base' | 'source' | 'sync child' | 'async child' | 'merge';

export type Subscribable<A> = {
  subscribe(
    next: (v: A) => void,
    error?: (e?: any) => void,
    complete?: () => void
  ): Subscription;
};
