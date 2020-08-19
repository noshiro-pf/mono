import { testArrayEquality } from '../array-tester';
import { zeros } from './zeros';

testArrayEquality({
  testName: 'zeros 1',
  target: zeros(3),
  toBe: [0, 0, 0],
});

testArrayEquality({
  testName: 'zeros 2',
  target: zeros(0),
  toBe: [],
});

testArrayEquality({
  testName: 'zeros 3',
  target: zeros(1),
  toBe: [0],
});
