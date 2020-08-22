import { testArrayEquality } from '../array-tester';
import { zip } from './zip';

testArrayEquality({
  testName: 'zip 2 arrays',
  target: zip([0, 1, 2, 3, 4], [5, 6, 7, 8, 9]),
  toBe: [
    [0, 5],
    [1, 6],
    [2, 7],
    [3, 8],
    [4, 9],
  ],
});

testArrayEquality({
  testName: 'zip 3 arrays',
  target: zip(
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 999, 999],
    [10, 11, 12, 13, 14, 999]
  ),
  toBe: [
    [0, 5, 10],
    [1, 6, 11],
    [2, 7, 12],
    [3, 8, 13],
    [4, 9, 14],
  ],
});
