import { describe, expect, test } from 'vitest';
import { compose } from './compose.mjs';

const fn1 = (x: number): readonly [number, number] => [x, x];
const fn2 = (xx: readonly [number, number]): string => `${xx[0]}+${xx[1]}`;

describe('compose', () => {
  const fn = compose.chain(fn1).chain(fn2).fn satisfies (a: number) => string;

  test('compose two functions', () => {
    expect(fn(3)).toBe('3+3');
  });
});
