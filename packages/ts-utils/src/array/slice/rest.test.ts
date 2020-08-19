import { testArrayEquality } from '../array-tester';
import { rest } from './rest';

testArrayEquality({
  testName: 'rest',
  target: rest([1, 2, 3, 4, 5]),
  toBe: [2, 3, 4, 5],
});
testArrayEquality({
  testName: 'rest',
  target: rest([2, 3, 4, 5]),
  toBe: [3, 4, 5],
});
testArrayEquality({
  testName: 'rest',
  target: rest([3, 4, 5]),
  toBe: [4, 5],
});
testArrayEquality({
  testName: 'rest',
  target: rest([4, 5]),
  toBe: [5],
});
testArrayEquality({
  testName: 'rest',
  target: rest([5]),
  toBe: [],
});
testArrayEquality({
  testName: 'rest',
  target: rest([]),
  toBe: [],
});
