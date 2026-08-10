import { isApplication } from './is-lambda-term.mjs';

test('isApplication 1', () => {
  expect(isApplication('x')).toBe(false);
});

test('isApplication 2', () => {
  expect(
    isApplication([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ]),
  ).toBe(true);
});

test('isApplication 3', () => {
  expect(isApplication(['lambda', 'x', ['x', ['y', 'y']]])).toBe(false);
});
