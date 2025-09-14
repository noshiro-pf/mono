import { number, string } from '../primitives/index.mjs';
import { pick } from './pick.mjs';
import { record } from './record.mjs';

describe('pick - allowExcessProperties propagation', () => {
  const base = record(
    { a: string(), b: number(), c: number() },
    {
      allowExcessProperties: false,
    },
  );

  test('inherits allowExcessProperties when option omitted', () => {
    const t = pick(base, ['a', 'b']);
    // Should reject excess properties
    expect(t.is({ a: '', b: 1, extra: 'x' })).toBe(false);
  });

  test('overrides allowExcessProperties when provided', () => {
    const t = pick(base, ['a', 'b'], { allowExcessProperties: true });
    // Should allow excess properties now
    expect(t.is({ a: '', b: 1, extra: 'x' })).toBe(true);
  });
});
