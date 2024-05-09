import { describe, expect, test } from 'vitest';
import { isApplication } from './is-lambda-term.mjs';

describe('isApplication', () => {
  test('case 1', () => {
    expect(isApplication('x')).toBe(false);
  });

  test('case 2', () => {
    expect(
      isApplication([
        ['x', ['y', 'y']],
        ['x', ['y', 'y']],
      ]),
    ).toBe(true);
  });

  test('case 3', () => {
    expect(isApplication(['lambda', 'x', ['x', ['y', 'y']]])).toBe(false);
  });
});
