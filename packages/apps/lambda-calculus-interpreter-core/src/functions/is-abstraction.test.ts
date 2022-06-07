import { isAbstraction } from './is-lambda-term';

test('isAbstraction 1', () => {
  expect(isAbstraction('x')).toBe(false);
});

test('isAbstraction 2', () => {
  expect(
    isAbstraction([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ])
  ).toBe(false);
});

test('isAbstraction 3', () => {
  expect(isAbstraction(['lambda', 'x', ['x', ['y', 'y']]])).toBe(true);
});
