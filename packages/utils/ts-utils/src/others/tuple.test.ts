import { expectType } from '../expect-type';
import { tp } from './tuple';

describe('tp', () => {
  test('test type', () => {
    const tuple = tp(1, 2, 3);
    expect(tuple).toStrictEqual([1, 2, 3]);

    expectType<typeof tuple, readonly [number, number, number]>('=');
  });
});