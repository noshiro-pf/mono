import { testArrayEquality } from '../array-tester';
import { range } from './range';

testArrayEquality({
  testName: 'range(1, 3)',
  target: range(1, 3),
  toBe: [1, 2],
});

testArrayEquality({
  testName: 'range(0, 0)',
  target: range(0, 0),
  toBe: [],
});

testArrayEquality({
  testName: 'range 3',
  target: range(0, 1),
  toBe: [0],
});
