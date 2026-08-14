import { isAbstraction } from './is-lambda-term.mjs';

test('isAbstraction 1', () => {
  assert.isFalse(isAbstraction('x'));
});

test('isAbstraction 2', () => {
  assert.isFalse(
    isAbstraction([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ]),
  );
});

test('isAbstraction 3', () => {
  assert.isTrue(isAbstraction(['lambda', 'x', ['x', ['y', 'y']]]));
});
