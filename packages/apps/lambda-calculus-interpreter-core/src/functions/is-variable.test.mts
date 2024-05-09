import { describe, expect, test } from 'vitest';
import { isVariable } from './is-variable.mjs';

describe('isVariable', () => {
  test('case 1', () => {
    expect(isVariable('x')).toBe(true);
  });

  test('case 2', () => {
    expect(
      isVariable([
        ['x', ['y', 'y']],
        ['x', ['y', 'y']],
      ]),
    ).toBe(false);
  });

  test('case 3', () => {
    expect(isVariable(['lambda', 'x', ['x', ['y', 'y']]])).toBe(false);
  });
});
