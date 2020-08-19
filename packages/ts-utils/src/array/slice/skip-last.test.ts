import { testArrayEquality } from '../array-tester';
import { skipLast } from './skip-last';

testArrayEquality({
  testName: 'skipLast',
  target: skipLast([1, 2, 3, 4, 5], 3),
  toBe: [1, 2],
});

testArrayEquality({
  testName: 'skipLast',
  target: skipLast([1, 2, 3, 4, 5], 0),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skipLast',
  target: skipLast([1, 2, 3, 4, 5], -1),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skipLast',
  target: skipLast([1, 2, 3, 4, 5], 5),
  toBe: [],
});

testArrayEquality({
  testName: 'skipLast',
  target: skipLast([1, 2, 3, 4, 5], 6),
  toBe: [],
});
