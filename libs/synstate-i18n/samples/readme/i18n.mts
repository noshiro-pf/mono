import { createI18n } from 'synstate-i18n';
import { en } from './en.mjs';

export const i18n = createI18n({
  baseLocale: 'en',
  baseMessages: en,
  translations: {
    // Loaded the first time the locale is asked for, as a chunk of its own.
    ja: () => import('./ja.mjs').then((m) => m.ja),
  },
});
