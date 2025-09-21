import { number } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { recursion } from './recursion.mjs';

describe('recursion - caching and defaultValue', () => {
  test('computes inner type only once and caches defaultValue', () => {
    let mut_calls = 0;
    const T = recursion('T', () => {
      mut_calls += 1;
      return record({ x: number(1) });
    });

    // First access computes and caches
    expect(T.defaultValue).toStrictEqual({ x: 1 });
    // Second access uses cache without recomputing
    expect(T.defaultValue).toStrictEqual({ x: 1 });
    expect(mut_calls).toBe(1);

    // Using is()/fill()/validate() does not trigger additional definition calls
    expect(T.is({ x: 2 })).toBe(true);
    expect(T.fill({})).toStrictEqual({ x: 1 });
    expect(mut_calls).toBe(1);
  });

  test('uses provided options.defaultValue without computing inner default', () => {
    let mut_calls = 0;
    const T = recursion(
      'T2',
      () => {
        mut_calls += 1;
        return record({ x: number(7) });
      },
      { defaultValue: { x: 0 } },
    );

    // defaultValue prefers options.defaultValue
    expect(T.defaultValue).toStrictEqual({ x: 0 });
    // validate triggers definition exactly once
    expect(T.is({ x: 7 })).toBe(true);
    expect(mut_calls).toBe(1);
  });
});
