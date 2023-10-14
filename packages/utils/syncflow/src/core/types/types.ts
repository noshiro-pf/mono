import { type Queue } from '@noshiro/ts-utils';

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
    onComplete?: () => void,
  ) => Subscription;
}>;
