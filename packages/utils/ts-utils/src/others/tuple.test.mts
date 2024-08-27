import { expectType } from '../expect-type.mjs';
import { tp } from './tuple.mjs';

describe('tp', () => {
  test('test type', () => {
    const tuple = tp(1, 2, 3);
    expect(tuple).toStrictEqual([1, 2, 3]);

    expectType<typeof tuple, readonly [1, 2, 3]>('=');
  });
});
