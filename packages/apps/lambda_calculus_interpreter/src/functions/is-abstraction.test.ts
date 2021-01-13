import { isAbstraction } from './is-abstraction';

test('isAbstraction 1', () => {
  expect(isAbstraction('x')).toBeFalsy();
});

test('isAbstraction 2', () => {
  expect(
    isAbstraction([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ])
  ).toBeFalsy();
});

test('isAbstraction 3', () => {
  expect(isAbstraction(['lambda', 'x', ['x', ['y', 'y']]])).toBeTruthy();
});
