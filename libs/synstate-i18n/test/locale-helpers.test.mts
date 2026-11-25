// cspell:ignore Stück
import { negotiateLocale, plural } from '../src/index.mjs';

describe(plural, () => {
  test('picks the form by the locale’s plural rules', () => {
    const en = plural('en');

    assert.strictEqual(en(1, { one: '# item', other: '# items' }), '1 item');

    assert.strictEqual(en(0, { one: '# item', other: '# items' }), '0 items');

    const ar = plural('ar');

    const forms = {
      zero: 'zero',
      one: 'one',
      two: 'two',
      few: 'few',
      many: 'many',
      other: 'other',
    } as const;

    assert.deepStrictEqual(
      [0, 1, 2, 3, 11, 100].map((n) => ar(n, forms)),
      ['zero', 'one', 'two', 'few', 'many', 'other'],
    );
  });

  test('falls back to `other` for a form not given', () => {
    assert.strictEqual(plural('en')(1, { other: '# items' }), '1 items');
  });

  test('writes `#` as the number in the locale', () => {
    assert.strictEqual(
      plural('en')(1000, { one: '# item', other: '# items' }),
      '1,000 items',
    );

    assert.strictEqual(plural('de')(1000, { other: '# Stück' }), '1.000 Stück');
  });
});

describe(negotiateLocale, () => {
  const supported = ['en', 'ja', 'zh-Hant'] as const;

  test('reads an underscore as a hyphen', () => {
    assert.strictEqual(negotiateLocale(['ja_JP'], supported, 'en'), 'ja');

    // In a supported tag too.
    assert.strictEqual(
      negotiateLocale(['en-US', 'ja'], ['en_US', 'ja'], 'ja'),
      'en_US',
    );

    assert.strictEqual(
      negotiateLocale(['en_US', 'ja'], ['en_US', 'ja'], 'ja'),
      'en_US',
    );
  });

  test('of two supported tags that read the same, takes the one as requested, then the first', () => {
    assert.strictEqual(
      negotiateLocale(['en-US'], ['en_US', 'en-US'], 'en_US'),
      'en-US',
    );

    assert.strictEqual(
      negotiateLocale(['en-us'], ['en_US', 'EN_us'], 'en_US'),
      'en_US',
    );
  });

  test('takes the first exact match, ignoring case', () => {
    assert.strictEqual(
      negotiateLocale(['fr', 'JA', 'en'], supported, 'en'),
      'ja',
    );

    assert.strictEqual(
      negotiateLocale(['zh-hant'], supported, 'en'),
      'zh-Hant',
    );
  });

  test('shortens a tag a subtag at a time until it matches (RFC 4647 lookup)', () => {
    assert.strictEqual(negotiateLocale(['ja-JP', 'en'], supported, 'en'), 'ja');

    assert.strictEqual(
      negotiateLocale(['zh-Hant-TW'], supported, 'en'),
      'zh-Hant',
    );
  });

  test('drops a single-character subtag together with the one after it', () => {
    assert.strictEqual(
      negotiateLocale(['zh-Hant-x-a'], ['zh-Hant-x', 'zh-Hant'], 'zh-Hant-x'),
      'zh-Hant',
    );

    // The tag as it is is always tried, a last single-character subtag and all.
    assert.strictEqual(
      negotiateLocale(['en-x-a'], ['en-x-a', 'ja'], 'ja'),
      'en-x-a',
    );
  });

  test('a tag earlier in the list wins, even matched by its language alone', () => {
    assert.strictEqual(negotiateLocale(['en-GB', 'ja'], supported, 'ja'), 'en');
  });

  test('falls back when nothing matches', () => {
    assert.strictEqual(negotiateLocale(['fr', 'de'], supported, 'en'), 'en');

    assert.strictEqual(negotiateLocale([], supported, 'ja'), 'ja');
  });

  test('ignores a tag that is not well formed', () => {
    assert.strictEqual(
      negotiateLocale(['', '***', 'ja'], supported, 'en'),
      'ja',
    );
  });
});
