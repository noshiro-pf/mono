import type { uint32 } from '../../types';
import { testArrayEquality } from '../array-tester';
import { safeSlice } from './safe-slice';

const target = [0, 1, 2, 3, 4];

testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0 as uint32, 5 as uint32),
  toBe: target,
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0 as uint32, 6 as uint32),
  toBe: target,
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1 as uint32, 5 as uint32),
  toBe: target,
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1 as uint32, 6 as uint32),
  toBe: target,
}); // 両方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0 as uint32, 3 as uint32),
  toBe: [0, 1, 2],
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1 as uint32, 3 as uint32),
  toBe: [0, 1, 2],
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 3 as uint32, 5 as uint32),
  toBe: [3, 4],
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 3 as uint32, 6 as uint32),
  toBe: [3, 4],
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 4 as uint32, 3 as uint32),
  toBe: [],
}); // start > end
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0 as uint32, -1 as uint32),
  toBe: [],
}); // start > end
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1 as uint32, -2 as uint32),
  toBe: [],
}); // start > end
