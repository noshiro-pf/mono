import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { mergeRecords } from './merge-records.mjs';

describe('mergeRecords - fill and defaultType', () => {
  const A = record({ a: string(), s: string('S') });
  const B = record({ b: number(1), s: string('B') });

  test('fill with non-record uses merged defaults', () => {
    const T = mergeRecords([A, B]);

    // Non-record input: should merge defaults from A and B
    assert.deepStrictEqual(T.fill(null), { a: '', b: 1, s: 'B' });
  });

  test('fill with record merges filled values and input own props', () => {
    const T = mergeRecords([A, B]);
    const input = { a: 'x', extra: 'keep' } as const;

    // Should keep input.extra and fill missing from A/B
    assert.deepStrictEqual(
      T.fill(input),
      T.cast({
        a: 'x',
        b: 1,
        s: 'B',
        extra: 'keep',
      }),
    );
  });

  test('custom defaultType overrides fallback fill/default', () => {
    const Default = record({ a: string('dA'), b: number(9), s: string('dS') });
    const T = mergeRecords([A, B], { defaultType: Default });

    // defaultValue comes from defaultType
    assert.deepStrictEqual(T.defaultValue, { a: 'dA', b: 9, s: 'dS' });

    // fill uses defaultType.fill when invalid
    assert.deepStrictEqual(T.fill(undefined), { a: 'dA', b: 9, s: 'dS' });
  });
});
