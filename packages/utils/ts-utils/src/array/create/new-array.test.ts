import { testArrayEquality } from '../array-tester';
import { newArray } from './new-array';

testArrayEquality({
  testName: 'newArray 1',
  target: newArray(3, 0),
  toBe: [0, 0, 0],
});

testArrayEquality({
  testName: 'newArray 1',
  target: newArray(3, 1),
  toBe: [1, 1, 1],
});

testArrayEquality({
  testName: 'newArray 2',
  target: newArray(0, 0),
  toBe: [],
});

testArrayEquality({
  testName: 'newArray 3',
  target: newArray(1, 0),
  toBe: [0],
});

testArrayEquality({
  testName: 'newArray 4',
  target: newArray(1.5, 0),
  toBe: [0],
});

testArrayEquality({
  testName: 'newArray 4',
  target: newArray(-1.5, 0),
  toBe: [],
});
