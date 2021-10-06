import type { Queue } from '@noshiro/ts-utils';
import { assertNotType, assertType } from '@noshiro/ts-utils';

export type TupleToQueueTuple<T extends readonly unknown[]> = {
  [P in keyof T]: Queue<T[P]>;
};

export type NonEmptyUnknownList = readonly [unknown, ...unknown[]];

export type Subscriber<A> = Readonly<{
  onNext: (v: A) => void;
  onComplete: () => void;
}>;

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export type Subscribable<A> = Readonly<{
  subscribe: (
    onNext: (nextValue: A) => void,
    onError?: (error?: unknown) => void,
    onComplete?: () => void
  ) => Subscription;
}>;

// type tests

assertType<
  TypeEq<
    TupleToQueueTuple<readonly [number, string, boolean]>,
    readonly [Queue<number>, Queue<string>, Queue<boolean>]
  >
>();

// Subscriber is covariant
assertType<TypeExtends<Subscriber<number>, Subscriber<1>>>();
assertNotType<TypeExtends<Subscriber<1>, Subscriber<number>>>();
assertNotType<TypeExtends<Subscriber<number>, Subscriber<'1'>>>();
assertNotType<TypeExtends<Subscriber<'1'>, Subscriber<number>>>();
