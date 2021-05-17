import type { uint32 } from '../../types';
import { at } from './at';

test('at', () => {
  expect(at([1, 2, 3, 4, 5], -1 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 0 as uint32)).toEqual(1);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 1 as uint32)).toEqual(2);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 2 as uint32)).toEqual(3);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 3 as uint32)).toEqual(4);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 4 as uint32)).toEqual(5);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 5 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 6 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], -1 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], 0 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], 1 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at([1], -1 as uint32)).toEqual(undefined);
});
test('at', () => {
  expect(at([1], 0 as uint32)).toEqual(1);
});
test('at', () => {
  expect(at([1], 1 as uint32)).toEqual(undefined);
});
