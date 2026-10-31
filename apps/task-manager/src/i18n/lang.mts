/**
 * Which language the page is shown in: `?lang=en` or `?lang=ja` when the URL
 * says, otherwise the one chosen on this device, otherwise the first of the
 * browser's languages the page has, otherwise English. Outside a browser it is
 * Japanese (`messages.mts`).
 *
 * The language is decided once, when the page loads: choosing one stores it and
 * loads the page again (`chooseLang`).
 */

import type { ReadonlyRecord } from 'ts-type-forge';

export const langs = ['ja', 'en'] as const;

export type Lang = (typeof langs)[number];

/** What is kept on this device: a language, or `'auto'` to follow the browser. */
export type LangSetting = Lang | 'auto';

/** The names the languages are listed under, each in itself. */
export const langNames = {
  ja: '日本語',
  en: 'English',
} as const satisfies ReadonlyRecord<Lang, string>;

/** The language the URL asks for (`?lang=`), if it is one the page has. */
export const langAsked = (search: string): Lang | undefined => {
  const params = new URLSearchParams(search);

  return parseTag(params.get(LANG_KEY) ?? '');
};

export const resolveLang = ({
  asked,
  setting,
  browserLanguages,
}: Readonly<{
  asked: Lang | undefined;
  setting: LangSetting;
  browserLanguages: readonly string[];
}>): Lang => {
  if (asked !== undefined) {
    return asked;
  }

  if (setting !== 'auto') {
    return setting;
  }

  const known = browserLanguages
    .map(parseTag)
    .find((lang) => lang !== undefined);

  return known ?? 'en';
};

/** What is kept, or `'auto'` for nothing kept or anything unknown. */
export const parseLangSetting = (stored: string | null): LangSetting =>
  parseLang(stored) ?? 'auto';

/**
 * The URL's query, `?` and all or empty, to load the page again with after
 * `choice` is made: without `?lang=` once the choice is `kept` on this device,
 * so that it decides — or, where nothing can be kept, asking for the language
 * chosen.
 */
export const searchAfterChoice = ({
  search,
  choice,
  kept,
}: Readonly<{
  search: string;
  choice: LangSetting;
  kept: boolean;
}>): string => {
  const params = new URLSearchParams(search);

  if (kept || choice === 'auto') {
    params.delete(LANG_KEY);
  } else {
    params.set(LANG_KEY, choice);
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
};

/** The `localStorage` key of the language chosen on this device. */
export const LANG_STORAGE_KEY = 'task-manager-app:lang';

const LANG_KEY = 'lang';

const parseLang = (value: string | null): Lang | undefined =>
  langs.find((lang) => lang === value);

/**
 * A language tag's language, `en-GB`, `ja_JP` or `JA` as well as `en`, if the
 * page has it.
 */
const parseTag = (tag: string): Lang | undefined =>
  parseLang(tag.split(/[-_]/u, 1)[0]?.toLowerCase() ?? null);
