/**
 * The few things the store takes from the browser, each wrapped so that a
 * failure — storage disabled in a private window, a browser without
 * `matchMedia` — degrades to a default instead of stopping the page.
 */

import {
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { Mutable } from 'ts-type-forge';
import type { PersistedSetting } from './view-model/index.mjs';

/** The setting stored on this device, or its default. */
export const loadSetting = <A,>(setting: PersistedSetting<A>): A =>
  setting.parse(readStorage(setting.key));

/** What stores the setting on this device. */
export const saveSetting =
  <A,>(setting: PersistedSetting<A>) =>
  (value: A): void => {
    writeStorage(setting.key, setting.serialize(value));
  };

/** The URL's query, `?` and all, or nothing. */
export const readLocationSearch = (): string => globalThis.location.search;

/**
 * Puts `search` in place of the URL's query, keeping the rest of the URL and
 * adding no entry to the history.
 */
export const replaceLocationSearch = (search: string): void => {
  const { pathname, hash } = globalThis.location;

  // The whole path, not just the query: `replaceState` with an empty URL
  // resolves to the current one, so taking out the last parameter would
  // otherwise change nothing.
  try {
    window.history.replaceState(
      window.history.state,
      '',
      `${pathname}${search}${hash}`,
    );
  } catch {
    // Safari refuses after too many calls in a row; a reload then shows the
    // screen the URL last said, which is all that is lost.
  }
};

/**
 * A DOM event as an observable, listened to for as long as the page is open —
 * which is as long as anything in the store lives.
 */
export const fromEvent = (
  target: Readonly<EventTarget>,
  type: string,
): SynstateObservable<void> => {
  const [event$, emit] = createEventEmitter();

  target.addEventListener(type, emit);

  return event$;
};

/** Hands the reader the JSON `text` as a file named `fileName` to save. */
export const downloadJson = (fileName: string, text: string): void => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );

  const mut_link: Mutable<HTMLAnchorElement> = document.createElement('a');

  mut_link.href = url;

  mut_link.download = fileName;

  mut_link.click();

  // Not at once: some browsers, Safari among them, read the URL only after the
  // click has returned, and fail the download if it is gone.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 40_000);
};

/** A media query, as the `MediaDeps` of `createMediaStore`. */
export const mediaQuery = (
  query: string,
): Readonly<{
  matches: () => boolean;
  change: SynstateObservable<void>;
}> => {
  const list = matchMedia(query);

  return {
    matches: () => list.matches,
    change: fromEvent(list, 'change'),
  };
};

/**
 * The browser's languages, the most preferred first; a browser that hides them,
 * or names none, gives its one language, or none at all.
 */
export const browserLanguages = (): readonly string[] => {
  const { languages, language } = navigator as Partial<Navigator>;

  return Arr.isArray(languages) && Arr.isNonEmpty(languages)
    ? languages
    : typeof language === 'string'
      ? [language]
      : [];
};

/**
 * Loads the page again with `search` as the URL's query, in place of this entry
 * of the history.
 */
export const reloadWithSearch = (search: string): void => {
  const { pathname, search: current, hash } = globalThis.location;

  // To the same URL with a `#…`, `replace` would only scroll.
  if (search === current) {
    globalThis.location.reload();
  } else {
    globalThis.location.replace(`${pathname}${search}${hash}`);
  }
};

/** What is stored under `key`, or nothing if storage cannot be read. */
export const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Whether `value` was stored: a preference not kept loses only that. */
export const writeStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);

    return true;
  } catch {
    return false;
  }
};

/** Whether nothing is left stored under `key`, which a full storage allows. */
export const removeStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);

    return true;
  } catch {
    return false;
  }
};
