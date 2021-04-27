import { uint32 } from '../../types';
import { testArrayEquality } from '../array-tester';
import { skip } from './skip';

testArrayEquality({
  testName: 'skipLast',
  target: skip([1, 2, 3, 4, 5], 3 as uint32),
  toBe: [4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 0 as uint32),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], -1 as uint32),
  toBe: [1, 2, 3, 4, 5],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 5 as uint32),
  toBe: [],
});

testArrayEquality({
  testName: 'skip',
  target: skip([1, 2, 3, 4, 5], 6 as uint32),
  toBe: [],
});
