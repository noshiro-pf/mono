import { testArrayEquality } from '../array-tester';
import { safeSlice } from './safe-slice';

const target = [0, 1, 2, 3, 4];

testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0, 5),
  toBe: target,
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0, 6),
  toBe: target,
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1, 5),
  toBe: target,
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1, 6),
  toBe: target,
}); // 両方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0, 3),
  toBe: [0, 1, 2],
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1, 3),
  toBe: [0, 1, 2],
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 3, 5),
  toBe: [3, 4],
}); // 正常
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 3, 6),
  toBe: [3, 4],
}); // 片方オーバー
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 4, 3),
  toBe: [],
}); // start > end
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, 0, -1),
  toBe: [],
}); // start > end
testArrayEquality({
  testName: 'safeSlice',
  target: safeSlice(target, -1, -2),
  toBe: [],
}); // start > end
