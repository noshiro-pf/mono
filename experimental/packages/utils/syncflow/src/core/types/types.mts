import { expectType, type Queue } from '@noshiro/ts-utils';

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

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

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
}
