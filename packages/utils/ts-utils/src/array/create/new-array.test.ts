import { assertType, TypeEq, uint32 } from '../../types';
import { testArrayEquality } from '../array-tester';
import { newArray } from './new-array';

const array1 = newArray(3 as uint32, 0);
assertType<TypeEq<typeof array1, number[]>>();

const array2 = newArray(3, 0);
assertType<TypeEq<typeof array2, number[] | undefined>>();

testArrayEquality({
  testName: 'newArray 1',
  target: newArray(3 as uint32, 0),
  toBe: [0, 0, 0],
});

testArrayEquality({
  testName: 'newArray 1',
  target: newArray(3 as uint32, 1),
  toBe: [1, 1, 1],
});

testArrayEquality({
  testName: 'newArray 2',
  target: newArray(0 as uint32, 0),
  toBe: [],
});

testArrayEquality({
  testName: 'newArray 3',
  target: newArray(1 as uint32, 0),
  toBe: [0],
});

testArrayEquality({
  testName: 'newArray 4',
  target: newArray(1.5, 0),
  toBe: undefined,
});

testArrayEquality({
  testName: 'newArray 4',
  target: newArray(-1.5, 0),
  toBe: undefined,
});
