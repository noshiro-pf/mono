import { isEmpty } from './is-empty';

test('empty', () => {
  expect(isEmpty([])).toBeTruthy();
});

test('empty', () => {
  expect(isEmpty([1])).toBeFalsy();
});
