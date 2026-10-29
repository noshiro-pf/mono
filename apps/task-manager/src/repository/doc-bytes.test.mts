import { docBytes } from './doc-bytes.mjs';

describe(docBytes, () => {
  test('counts as Firestore does', () => {
    assert.strictEqual(docBytes('ab'), 3);

    assert.strictEqual(docBytes('あ'), 4);

    assert.strictEqual(docBytes(1.5), 8);

    assert.strictEqual(docBytes(true), 1);

    assert.strictEqual(docBytes(null), 1);

    assert.strictEqual(docBytes(['a', 1]), 2 + 8);

    assert.strictEqual(docBytes({ ab: 'c', n: { x: 1 } }), 3 + 2 + 2 + 2 + 8);
  });

  test('counts a quote or a newline as one byte, not as JSON escapes it', () => {
    assert.strictEqual(docBytes('"\n'), 3);
  });
});
