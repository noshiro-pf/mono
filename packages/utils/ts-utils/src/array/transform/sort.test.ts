import { assertType, TypeEq } from '../../types';
import { testArrayEquality } from '../array-tester';
import { ReadonlyNonEmptyArray } from '../non-empty-array';
import { sort } from './sort';

const cmp = (a: number, b: number): number => a - b;

testArrayEquality({
  testName: 'sort',
  target: sort(cmp)([3, 4, 1, 2]),
  toBe: [1, 2, 3, 4],
});

testArrayEquality({
  testName: 'sort',
  target: sort(cmp)([]),
  toBe: [],
});

testArrayEquality({
  testName: 'sort',
  target: sort(cmp)([2, 2, 2]),
  toBe: [2, 2, 2],
});

const array: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
const sorted = sort(cmp)(array);
assertType<TypeEq<typeof sorted, ReadonlyNonEmptyArray<number>>>();

const array2: ReadonlyNonEmptyArray<1 | 2 | 3> = [1, 2, 3] as const;
const sorted2 = sort(cmp)(array2);
assertType<TypeEq<typeof sorted2, ReadonlyNonEmptyArray<1 | 2 | 3>>>();

const tuple = [1, 2, 3] as const;
const sorted3 = sort(cmp)(tuple);
assertType<
  TypeEq<typeof sorted3, readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]>
>();
