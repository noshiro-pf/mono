import { number, string } from '../primitives/index.mjs';
import { omit } from './omit.mjs';
import { record } from './record.mjs';

describe('omit - allowExcessProperties propagation', () => {
  const base = record(
    { a: string(), b: number(), c: number() },
    {
      excessPropertyValidation: 'error',
      excessPropertyFill: 'strip',
    },
  );

  test('inherits allowExcessProperties when option omitted', () => {
    const t = omit(base, ['c']);

    // Should reject excess properties

    assert.isFalse(t.is({ a: '', b: 1, extra: 'x' }));
  });

  test('overrides allowExcessProperties when provided', () => {
    const t = omit(base, ['c'], {
      excessPropertyValidation: 'allow',
      excessPropertyFill: 'allow',
    });

    // Should allow excess properties now

    assert.isTrue(t.is({ a: '', b: 1, extra: 'x' }));
  });
});
