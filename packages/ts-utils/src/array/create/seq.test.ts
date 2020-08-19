import { testArrayEquality } from '../array-tester';
import { seq } from './seq';

testArrayEquality({
  testName: 'seq 1',
  target: seq(3),
  toBe: [0, 1, 2],
});

testArrayEquality({
  testName: 'seq 2',
  target: seq(0),
  toBe: [],
});

testArrayEquality({
  testName: 'seq 3',
  target: seq(1),
  toBe: [0],
});
