import { isApplication } from './is-application';

test('isApplication 1', () => {
  expect(isApplication('x')).toBeFalsy();
});

test('isApplication 2', () => {
  expect(
    isApplication([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ])
  ).toBeTruthy();
});

test('isApplication 3', () => {
  expect(isApplication(['lambda', 'x', ['x', ['y', 'y']]])).toBeFalsy();
});
