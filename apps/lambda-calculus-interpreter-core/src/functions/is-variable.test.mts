import { isVariable } from './is-variable.mjs';

test('isVariable 1', () => {
  assert.isTrue(isVariable('x'));
});

test('isVariable 2', () => {
  assert.isFalse(
    isVariable([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ]),
  );
});

test('isVariable 3', () => {
  assert.isFalse(isVariable(['lambda', 'x', ['x', ['y', 'y']]]));
});
