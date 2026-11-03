import { anyLabelQualifier, notLabelQualifier } from './label-search.mjs';

describe(anyLabelQualifier, () => {
  test('quotes each name, so that a space or a comma stays in it', () => {
    assert.strictEqual(
      anyLabelQualifier(['good first issue', 'a,b']),
      'label:"good first issue","a,b"',
    );
  });
});

describe(notLabelQualifier, () => {
  test('leaves out a quote, which GitHub cannot take', () => {
    assert.strictEqual(notLabelQualifier('say "hi"'), '-label:"say hi"');
  });
});
