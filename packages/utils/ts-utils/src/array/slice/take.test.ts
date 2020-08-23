import { testArrayEquality } from '../array-tester';
import { take } from './take';

testArrayEquality({
  testName: 'take',
  target: take([1, 2, 3, 4, 5], 3),
  toBe: [1, 2, 3],
});
testArrayEquality({
  testName: 'take',
  target: take([1, 2, 3, 4, 5], 0),
  toBe: [],
});
testArrayEquality({
  testName: 'take',
  target: take([1, 2, 3, 4, 5], -1),
  toBe: [],
});
testArrayEquality({
  testName: 'take',
  target: take([1, 2, 3, 4, 5], 5),
  toBe: [1, 2, 3, 4, 5],
});
testArrayEquality({
  testName: 'take',
  target: take([1, 2, 3, 4, 5], 6),
  toBe: [1, 2, 3, 4, 5],
});
