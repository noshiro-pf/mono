import { describe, expect, test } from 'vitest';
import { isAbstraction } from './is-lambda-term.mjs';

describe('isAbstraction', () => {
  test('case 1', () => {
    expect(isAbstraction('x')).toBe(false);
  });

  test('case 2', () => {
    expect(
      isAbstraction([
        ['x', ['y', 'y']],
        ['x', ['y', 'y']],
      ]),
    ).toBe(false);
  });

  test('case 3', () => {
    expect(isAbstraction(['lambda', 'x', ['x', ['y', 'y']]])).toBe(true);
  });
});
