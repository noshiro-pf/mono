import { testArrayEquality } from '../array-tester';
import { scan } from './scan';

const add = (x: number, y: number): number => x + y;

testArrayEquality({
  testName: 'scan',
  target: scan([1, 2, 3], add, 0),
  toBe: [0, 1, 3, 6],
});

testArrayEquality({
  testName: 'scan',
  target: scan([1, 2, 3], add, 1),
  toBe: [1, 2, 4, 7],
});
