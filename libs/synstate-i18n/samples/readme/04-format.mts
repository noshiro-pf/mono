import { state } from 'synstate';
import { i18n } from './i18n.mjs';

if (import.meta.vitest !== undefined) {
  test('README: numbers and dates', async () => {
    // embed-sample-code-ignore-above
    const total = state(1234.5);

    const price = i18n.formatNumber(total, {
      style: 'currency',
      currency: 'JPY',
    });

    const day = i18n.formatDateTime(Date.UTC(2026, 11, 1), {
      dateStyle: 'long',
      timeZone: 'UTC',
    });

    assert.strictEqual(price.value, '¥1,235');

    assert.strictEqual(day.value, 'December 1, 2026');

    await i18n.setLocale('ja');

    assert.strictEqual(price.value, '￥1,235');

    assert.strictEqual(day.value, '2026年12月1日');
    // embed-sample-code-ignore-below

    await i18n.setLocale('en');
  });
}
