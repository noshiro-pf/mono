import { expectType, type Queue } from 'ts-data-forge';

export type TupleToQueueTuple<T extends readonly unknown[]> = Readonly<{
  [P in keyof T]: Queue<T[P]>;
}>;

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
    onComplete?: () => void,
  ) => Subscription;
}>;

// type tests

expectType<
  TupleToQueueTuple<readonly [number, string, boolean]>,
  readonly [Queue<number>, Queue<string>, Queue<boolean>]
>('=');

// Subscriber is covariant
expectType<Subscriber<number>, Subscriber<1>>('<=');

expectType<Subscriber<1>, Subscriber<number>>('!<=');

expectType<Subscriber<number>, Subscriber<'1'>>('!<=');

expectType<Subscriber<'1'>, Subscriber<number>>('!<=');
