import {
  assertNotType,
  assertType,
  Queue,
  TypeEq,
  TypeExtends,
} from '@noshiro/ts-utils';

export type TupleToQueueTuple<T extends unknown[]> = {
  [P in keyof T]: Queue<T[P]>;
};

export type NonEmptyUnknownList = [unknown, ...unknown[]];

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
    TupleToQueueTuple<[number, string, boolean]>,
    [Queue<number>, Queue<string>, Queue<boolean>]
  >
>();

// Subscriber is covariant
assertType<TypeExtends<Subscriber<number>, Subscriber<1>>>();
assertNotType<TypeExtends<Subscriber<1>, Subscriber<number>>>();
assertNotType<TypeExtends<Subscriber<number>, Subscriber<'1'>>>();
assertNotType<TypeExtends<Subscriber<'1'>, Subscriber<number>>>();
