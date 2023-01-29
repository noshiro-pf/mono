import { expectType, type Queue } from '@noshiro/ts-utils';
import { type Subscriber, type TupleToQueueTuple } from './types';

test('type test', () => {
  expect(1).toBe(1); // dummy

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
});
