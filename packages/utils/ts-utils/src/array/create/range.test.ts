import { uint32 } from '../../types';
import { testArrayEquality } from '../array-tester';
import { range } from './range';

testArrayEquality({
  testName: 'range(1, 3)',
  target: range(1 as uint32, 3 as uint32),
  toBe: [1, 2],
});

testArrayEquality({
  testName: 'range(0, 0)',
  target: range(0 as uint32, 0 as uint32),
  toBe: [],
});

testArrayEquality({
  testName: 'range 3',
  target: range(0 as uint32, 1 as uint32),
  toBe: [0],
});
