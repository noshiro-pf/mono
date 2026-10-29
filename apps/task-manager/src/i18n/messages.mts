/**
 * The text of the page in the language it is shown in (`lang`), as `m`:
 * `m.common.close`, `m.dag.selected(3)`. Every language has the same keys,
 * and the same parameters for each function, as the Japanese
 * (`messages-ja.mts`): one missing in another language is a type error.
 */

import {
  browserLanguages,
  readLocationSearch,
  readStorage,
  reloadWithSearch,
  removeStorage,
  writeStorage,
} from '../browser.mjs';
import {
  LANG_STORAGE_KEY,
  langAsked,
  parseLangSetting,
  resolveLang,
  searchAfterChoice,
  type Lang,
  type LangSetting,
} from './lang.mjs';
import { en } from './messages-en.mjs';
import { ja } from './messages-ja.mjs';

export type Messages = WidenedMessages<typeof ja>;

const inBrowser = typeof document !== 'undefined';

/** The language the URL asks for, if any: it wins over `langSetting`. */
export const langAskedByUrl: Lang | undefined = inBrowser
  ? langAsked(readLocationSearch())
  : undefined;

/** What is kept on this device. */
export const langSetting: LangSetting = inBrowser
  ? parseLangSetting(readStorage(LANG_STORAGE_KEY))
  : 'auto';

/**
 * The language of the page. Outside a browser — the unit tests — it is
 * Japanese, whatever the machine's language.
 */
export const lang: Lang = inBrowser
  ? resolveLang({
      asked: langAskedByUrl,
      setting: langSetting,
      browserLanguages: browserLanguages(),
    })
  : 'ja';

export const messagesOf = (language: Lang): Messages =>
  language === 'en' ? en : ja;

/** The text of the page. */
export const m: Messages = messagesOf(lang);

/**
 * Whether choosing `choice` would change nothing: the URL asks for no
 * language, and it is what this page was loaded by and what is kept still,
 * which another tab may have changed since.
 */
export const isLangChoiceKept = (choice: LangSetting): boolean =>
  langAskedByUrl === undefined &&
  choice === langSetting &&
  parseLangSetting(readStorage(LANG_STORAGE_KEY)) === choice;

/**
 * Keeps `choice` on this device and loads the page again by it, taking any
 * `?lang=` out of the URL so that it does not win over the choice — or,
 * where nothing can be kept, asking for the language chosen in the URL.
 */
export const chooseLang = (choice: LangSetting): void => {
  const kept =
    choice === 'auto'
      ? removeStorage(LANG_STORAGE_KEY)
      : writeStorage(LANG_STORAGE_KEY, choice);

  reloadWithSearch(
    searchAfterChoice({ search: readLocationSearch(), choice, kept }),
  );
};

/**
 * `ja` (`as const`) with each string and number widened, so that another
 * language may say something else in its place; read-only throughout.
 */
type WidenedMessages<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends (...args: infer A) => infer R
      ? (...args: A) => R
      : Readonly<{ [K in keyof T]: WidenedMessages<T[K]> }>;
