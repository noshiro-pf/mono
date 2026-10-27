/**
 * The few things the store takes from the browser, each wrapped so that a
 * failure — storage disabled in a private window, a browser without
 * `matchMedia` — degrades to a default instead of stopping the page.
 */

import {
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
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
 * Puts `search` in place of the URL's query, keeping the rest of the URL
 * and adding no entry to the history.
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
    // Safari refuses after too many calls in a row; a reload then shows
    // the screen the URL last said, which is all that is lost.
  }
};

/**
 * A DOM event as an observable, listened to for as long as the page is
 * open — which is as long as anything in the store lives.
 */
export const fromEvent = (
  target: Readonly<EventTarget>,
  type: string,
): SynstateObservable<void> => {
  const [event$, emit] = createEventEmitter();

  target.addEventListener(type, emit);

  return event$;
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

/** What is stored under `key`, or nothing if storage cannot be read. */
const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not kept between visits, which is all a preference loses.
  }
};
