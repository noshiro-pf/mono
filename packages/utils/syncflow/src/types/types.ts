import {
  assertNotType,
  assertType,
  Queue,
  TypeEq,
  TypeExtends,
} from '@noshiro/ts-utils';
import { Observable } from './observable';

export type ObservableValue<A> = A extends Observable<infer B> ? B : never;

export type Unwrap<A extends Observable<unknown>[]> = {
  [P in keyof A]: ObservableValue<A[P]>;
};

export type Wrap<A extends unknown[]> = { [P in keyof A]: Observable<A[P]> };

export type TupleToQueueTuple<T extends unknown[]> = {
  [P in keyof T]: Queue<T[P]>;
};

export type NonEmptyUnknownList = [unknown, ...unknown[]];

export type Operator<A, B> = (src: Observable<A>) => Observable<B>;

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

assertType<TypeExtends<number, ObservableValue<Observable<number>>>>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<
    [number, string],
    Unwrap<[Observable<number>, Observable<string>]>
  >
>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<[Observable<number>, Observable<number>], Wrap<[number, number]>>
>();
assertNotType<
  TypeExtends<[Observable<number>, Observable<string>], Wrap<[number, number]>>
>();

// Subscriber is covariant
assertType<TypeExtends<Subscriber<number>, Subscriber<1>>>();
assertNotType<TypeExtends<Subscriber<1>, Subscriber<number>>>();
assertNotType<TypeExtends<Subscriber<number>, Subscriber<'1'>>>();
assertNotType<TypeExtends<Subscriber<'1'>, Subscriber<number>>>();
