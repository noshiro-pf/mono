import { testArrayEquality } from '../array-tester';
import { scan } from './scan';

const add = (x: number, y: number): number => x + y;

testArrayEquality({
  testName: 'scan',
  target: scan(add, 0)([1, 2, 3]),
  toBe: [0, 1, 3, 6],
});

testArrayEquality({
  testName: 'scan',
  target: scan(add, 1)([1, 2, 3]),
  toBe: [1, 2, 4, 7],
});
