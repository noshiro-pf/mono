import { isApplication } from './is-lambda-term.mjs';

test('isApplication 1', () => {
  assert.isFalse(isApplication('x'));
});

test('isApplication 2', () => {
  assert.isTrue(
    isApplication([
      ['x', ['y', 'y']],
      ['x', ['y', 'y']],
    ]),
  );
});

test('isApplication 3', () => {
  assert.isFalse(isApplication(['lambda', 'x', ['x', ['y', 'y']]]));
});
