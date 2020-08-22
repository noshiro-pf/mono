import { testArrayEquality } from '../array-tester';
import { uniq, uniqBy } from './uniq';

testArrayEquality({
  testName: 'uniq',
  target: uniq([1, 2, 3, 2, 2, 2, 3, 4, 5, 5, 3, 2, 1, 3, 4, 1, 2]),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'uniq',
  target: uniq([1]),
  toBe: [1],
});

testArrayEquality({
  testName: 'uniq',
  target: uniq([]),
  toBe: [],
});

testArrayEquality({
  testName: 'uniqBy',
  target: uniqBy((a: number) => a % 3)([1, 2, 3, 4, 5, 6]),
  toBe: [1, 2, 3],
});
