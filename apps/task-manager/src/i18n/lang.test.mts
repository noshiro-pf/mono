import {
  langAsked,
  parseLangSetting,
  resolveLang,
  searchAfterChoice,
} from './lang.mjs';

describe(resolveLang, () => {
  test('takes the language the URL asks for first', () => {
    assert.strictEqual(
      resolveLang({
        asked: 'en',
        setting: 'ja',
        browserLanguages: ['ja-JP'],
      }),
      'en',
    );

    assert.strictEqual(
      resolveLang({
        asked: 'ja',
        setting: 'en',
        browserLanguages: ['en-US'],
      }),
      'ja',
    );
  });

  test('then the one chosen on this device', () => {
    assert.strictEqual(
      resolveLang({
        asked: undefined,
        setting: 'en',
        browserLanguages: ['ja-JP'],
      }),
      'en',
    );
  });

  test('then the first of the browser’s languages the page has', () => {
    assert.strictEqual(
      resolveLang({
        asked: undefined,
        setting: 'auto',
        browserLanguages: ['fr-FR', 'JA', 'en-GB'],
      }),
      'ja',
    );

    assert.strictEqual(
      resolveLang({
        asked: undefined,
        setting: 'auto',
        browserLanguages: ['en-GB', 'ja-JP'],
      }),
      'en',
    );
  });

  test('gives English for languages the page does not have', () => {
    assert.strictEqual(
      resolveLang({
        asked: undefined,
        setting: 'auto',
        browserLanguages: ['fr-FR', 'de'],
      }),
      'en',
    );
  });

  test('gives English when the browser names no language', () => {
    assert.strictEqual(
      resolveLang({ asked: undefined, setting: 'auto', browserLanguages: [] }),
      'en',
    );
  });
});

describe(parseLangSetting, () => {
  test('reads a language kept, and anything else as none chosen', () => {
    assert.strictEqual(parseLangSetting('en'), 'en');

    assert.strictEqual(parseLangSetting('ja'), 'ja');

    assert.strictEqual(parseLangSetting(null), 'auto');

    assert.strictEqual(parseLangSetting('"en"'), 'auto');
  });
});

describe(langAsked, () => {
  test('reads a language the page has from the URL', () => {
    assert.strictEqual(langAsked('?storage=memory&lang=en'), 'en');

    assert.strictEqual(langAsked('?lang=ja'), 'ja');

    assert.strictEqual(langAsked('?lang=en-US'), 'en');

    assert.strictEqual(langAsked('?lang=JA'), 'ja');

    assert.strictEqual(langAsked('?lang=ja_JP'), 'ja');

    assert.isUndefined(langAsked('?lang=fr'));

    assert.isUndefined(langAsked(''));
  });
});

describe(searchAfterChoice, () => {
  test('takes the language out once the choice is kept', () => {
    assert.strictEqual(
      searchAfterChoice({
        search: '?storage=memory&lang=en&view=list',
        choice: 'ja',
        kept: true,
      }),
      '?storage=memory&view=list',
    );

    assert.strictEqual(
      searchAfterChoice({ search: '?lang=ja', choice: 'ja', kept: true }),
      '',
    );

    assert.strictEqual(
      searchAfterChoice({ search: '', choice: 'en', kept: true }),
      '',
    );
  });

  test('asks for the language in the URL when nothing could be kept', () => {
    assert.strictEqual(
      searchAfterChoice({
        search: '?storage=memory&lang=en',
        choice: 'ja',
        kept: false,
      }),
      '?storage=memory&lang=ja',
    );

    assert.strictEqual(
      searchAfterChoice({ search: '', choice: 'en', kept: false }),
      '?lang=en',
    );

    assert.strictEqual(
      searchAfterChoice({ search: '?lang=en', choice: 'auto', kept: false }),
      '',
    );
  });
});
