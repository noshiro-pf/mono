import { assertType, TypeEq } from '../../types';
import { testArrayEquality } from '../array-tester';
import { ReadonlyNonEmptyArray } from '../non-empty-array';
import { map } from './map';

testArrayEquality({
  testName: 'map',
  target: map((x: number) => x * x)([1, 2, 3]),
  toBe: [1, 4, 9],
});

const array: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
const mapped = map((x: number) => x * x)(array);
assertType<TypeEq<typeof mapped, ReadonlyNonEmptyArray<number>>>();

const array2: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
const mapped2 = map((x: number, i) => x * x * i)(array2);
assertType<TypeEq<typeof mapped2, ReadonlyNonEmptyArray<number>>>();
