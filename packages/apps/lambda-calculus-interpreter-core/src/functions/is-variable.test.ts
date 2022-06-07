import { isVariable } from './is-variable';

test('isVariable 1', () => {
  expect(isVariable('x')).toBe(true);
});

test('isVariable 2', () => {
  expect(
    isVariable([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ])
  ).toBe(false);
});

test('isVariable 3', () => {
  expect(isVariable(['lambda', 'x', ['x', ['y', 'y']]])).toBe(false);
});
