import { at } from './at';

test('at', () => {
  expect(at([1, 2, 3, 4, 5], -1)).toEqual(undefined);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 0)).toEqual(1);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 1)).toEqual(2);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 2)).toEqual(3);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 3)).toEqual(4);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 4)).toEqual(5);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 5)).toEqual(undefined);
});
test('at', () => {
  expect(at([1, 2, 3, 4, 5], 6)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], -1)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], 0)).toEqual(undefined);
});
test('at', () => {
  expect(at<unknown>([], 1)).toEqual(undefined);
});
test('at', () => {
  expect(at([1], -1)).toEqual(undefined);
});
test('at', () => {
  expect(at([1], 0)).toEqual(1);
});
test('at', () => {
  expect(at([1], 1)).toEqual(undefined);
});
