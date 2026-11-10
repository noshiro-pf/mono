import { colorSchemeOf, themeCodec, themeOfPick } from './theme.mjs';

describe('themeCodec', () => {
  test('reads light and dark, and anything else as auto', () => {
    assert.strictEqual(
      themeCodec.read(new URLSearchParams('theme=dark')),
      'dark',
    );

    assert.strictEqual(themeCodec.read(new URLSearchParams('theme=x')), 'auto');
  });

  test('writes auto as no parameter', () => {
    const params = new URLSearchParams('theme=dark');

    themeCodec.write('auto', params);

    assert.strictEqual(params.toString(), '');

    themeCodec.write('light', params);

    assert.strictEqual(params.toString(), 'theme=light');
  });
});

test(colorSchemeOf, () => {
  assert.strictEqual(colorSchemeOf('auto', 'dark'), 'dark');

  assert.strictEqual(colorSchemeOf('light', 'dark'), 'light');
});

test(themeOfPick, () => {
  assert.strictEqual(themeOfPick('dark', 'dark'), 'auto');

  assert.strictEqual(themeOfPick('dark', 'light'), 'dark');
});
