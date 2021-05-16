import type { uint32 } from '../../types';
import { testArrayEquality } from '../array-tester';
import { takeLast } from './take-last';

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 3 as uint32),
  toBe: [3, 4, 5],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 0 as uint32),
  toBe: [],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], -1 as uint32),
  toBe: [],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 5 as uint32),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 6 as uint32),
  toBe: [1, 2, 3, 4, 5],
});
