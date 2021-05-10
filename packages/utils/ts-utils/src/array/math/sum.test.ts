import { assertType, TypeEq, uint32 } from '../../types';
import { sum } from './sum';

test('sum', () => {
  expect(sum([1, 2, 3])).toBe(6);
});

test('sum', () => {
  expect(sum([])).toBe(0);
});

test('sum', () => {
  expect(sum([1, 2, 3, 4])).toBe(10);
});

const xs = [1, 2, 3] as uint32[];
const s = sum(xs);
assertType<TypeEq<typeof s, uint32>>();

const ys = [1, 2, 3] as const;
const s2 = sum(ys);
assertType<TypeEq<typeof s2, number>>();
