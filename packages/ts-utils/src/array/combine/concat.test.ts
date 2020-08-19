import { testArrayEquality } from '../array-tester';
import { concat } from './concat';

testArrayEquality({
  testName: 'concat 2 arrays',
  target: concat([1, 2, 3], [4, 5, 6]),
  toBe: [1, 2, 3, 4, 5, 6],
});

testArrayEquality({
  testName: 'concat 2 arrays',
  target: concat([1, 2, 3], []),
  toBe: [1, 2, 3],
});

testArrayEquality({
  testName: 'concat 2 arrays',
  target: concat([], [4, 5, 6]),
  toBe: [4, 5, 6],
});

testArrayEquality({
  testName: 'concat 2 arrays',
  target: concat([], []),
  toBe: [],
});

testArrayEquality({
  testName: 'concat 2 arrays',
  target: concat(['1', '2', '3'], [4, 5, 6]),
  toBe: ['1', '2', '3', 4, 5, 6],
});
