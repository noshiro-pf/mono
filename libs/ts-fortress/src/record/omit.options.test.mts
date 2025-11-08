import { number, string } from '../primitives/index.mjs';
import { omit } from './omit.mjs';
import { record } from './record.mjs';

describe('omit - allowExcessProperties propagation', () => {
  const base = record(
    { a: string(), b: number(), c: number() },
    {
      allowExcessProperties: false,
    },
  );

  test('inherits allowExcessProperties when option omitted', () => {
    const t = omit(base, ['c']);

    // Should reject excess properties
    expect(t.is({ a: '', b: 1, extra: 'x' })).toBe(false);
  });

  test('overrides allowExcessProperties when provided', () => {
    const t = omit(base, ['c'], { allowExcessProperties: true });

    // Should allow excess properties now
    expect(t.is({ a: '', b: 1, extra: 'x' })).toBe(true);
  });
});
