import { CATEGORIES, classify } from './classify.mjs';

describe('classify', () => {
  test.each([
    ['helper ordering', ['order']],
    ['file order', ['order']],
    ['the new helper now comes before its caller', ['order']],
    ['stale docs (`url.mts`, `design.md`, README)', ['stale-docs']],
    ['ragged comments', ['wording']],
    ['the barrel', ['generated']],
    ['No test covered `start()` after `stop()` → added.', ['test-gap']],
    [
      'The last `map` stays imported. This was already the case before this PR.',
      ['pre-existing'],
    ],
    [
      'Unanchored `this` patterns: this predates this PR and is out of scope.',
      ['pre-existing', 'out-of-scope'],
    ],
    ['The same finding an earlier round dismissed, re-raised.', ['re-raised']],
    ['a focus ring that is visible on the selected blue label', ['a11y']],
    ['Japanese punctuation in English text', ['i18n']],
    ['the `10.0` rounding boundary', ['edge-case']],
    ['The guard is duplicated in two transformers.', ['duplication']],
    [
      'computing the callee range twice; no measurable efficiency gain',
      ['performance'],
    ],
    ['the `as unknown as FireAuthUser` cast', ['type-safety']],
    ['the changeset overstating the old path', ['stale-docs', 'changeset']],
  ] as const)('%s', (text, expected) => {
    assert.deepStrictEqual(classify(text), expected);
  });

  test('a finding no class names', () => {
    assert.deepStrictEqual(classify('`autocomplete="off"`'), []);
  });

  test('ids are unique', () => {
    const ids = CATEGORIES.map(({ id }) => id);

    const unique = new Set(ids);

    assert.strictEqual(unique.size, ids.length);
  });
});
