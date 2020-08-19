import { isNonEmpty } from './is-non-empty';

test('empty', () => {
  expect(isNonEmpty([1])).toBeTruthy();
});

test('empty', () => {
  expect(isNonEmpty([])).toBeFalsy();
});
