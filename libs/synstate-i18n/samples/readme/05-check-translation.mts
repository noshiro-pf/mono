import { checkTranslation } from 'synstate-i18n';
import { en } from './en.mjs';
import { ja } from './ja.mjs';

if (import.meta.vitest !== undefined) {
  // embed-sample-code-ignore-above
  test('ja translates every message of en', () => {
    assert.deepStrictEqual(checkTranslation(en, ja), []);
  });
  // embed-sample-code-ignore-below
}
