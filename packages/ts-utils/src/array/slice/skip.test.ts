import { testArrayEquality } from '../array-tester';
import { skip } from './skip';

testArrayEquality({
  testName: 'skipLast',
  target: skip([1, 2, 3, 4, 5], 3),
  toBe: [4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 0),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], -1),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 5),
  toBe: [],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 6),
  toBe: [],
});
