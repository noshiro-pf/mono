import { negotiateLocale } from 'synstate-i18n';
import { i18n } from './i18n.mjs';

/** Stands in for synstate-dom's `render`. */
const render = (): void => {};

if (import.meta.vitest !== undefined) {
  test('README: the locale to start in', async () => {
    const navigator = { languages: ['ja-JP', 'en-US'] } as const;

    // embed-sample-code-ignore-above
    // Before the first render, so that the page does not show English first.
    await i18n.setLocale(
      negotiateLocale(navigator.languages, i18n.locales, 'en'),
    );

    render();
    // embed-sample-code-ignore-below

    assert.strictEqual(i18n.locale.value, 'ja');

    await i18n.setLocale('en');
  });
}
