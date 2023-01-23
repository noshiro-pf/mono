import { assertNotType, assertType, type Queue } from '@noshiro/ts-utils';
import { type Subscriber, type TupleToQueueTuple } from './types';

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

test('dummy', () => {
  expect(1).toBe(1);
});
