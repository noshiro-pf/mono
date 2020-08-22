import { testArrayEquality } from '../array-tester';
import { map } from './map';

testArrayEquality({
  testName: 'map',
  target: map((x: number) => x * x)([1, 2, 3]),
  toBe: [1, 4, 9],
});
