import { testArrayEquality } from '../array-tester';
import { takeLast } from './take-last';

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 3),
  toBe: [3, 4, 5],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 0),
  toBe: [],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], -1),
  toBe: [],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 5),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'takeLast',
  target: takeLast([1, 2, 3, 4, 5], 6),
  toBe: [1, 2, 3, 4, 5],
});
