import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

const storageKey = 'serviceWorkerResetOrigins';

/**
 * The origins whose service workers are removed on sight.
 *
 * Per origin, because that is the only unit the browser offers: a service
 * worker is registered for a scope — `/` for the sites this matters to — and
 * `unregister()` takes the whole registration. "Only under `/issues`" is not
 * something that can be asked for, and the button that led here was already
 * removing the worker for the whole origin.
 *
 * Kept in `local` storage rather than in a workspace: it is a fact about a
 * site, not about one layout, and it should hold for every split view.
 */
export const loadServiceWorkerResetOrigins = async (): Promise<
  readonly string[]
> => {
  const stored = await chrome.storage.local.get(storageKey);

  return parseOrigins(stored[storageKey]);
};

/**
 * Calls back whenever the list is written, by any tab or frame.
 *
 * A list read once is a list that goes stale: a split view open in another tab
 * would go on letting the worker answer until that tab was reloaded, and a pane
 * would not start keeping it away until its page was loaded again — which is
 * what "always" looked like when it did not seem to stick.
 */
export const watchServiceWorkerResetOrigins = (
  onWritten: (origins: readonly string[]) => void,
): (() => void) => {
  const listener = (
    // As in `watchWorkspaceRegistry`: `chrome.storage.StorageChange` has
    // mutable fields, which a parameter type may not.
    changes: ReadonlyRecord<string, Readonly<{ newValue?: unknown }>>,
    areaName: string,
  ): void => {
    if (areaName !== 'local') {
      return;
    }

    const change = changes[storageKey];

    if (change !== undefined) {
      onWritten(parseOrigins(change.newValue));
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

export const setServiceWorkerResetOrigin = async (
  siteOrigin: string,
  enabled: boolean,
): Promise<readonly string[]> => {
  const current = await loadServiceWorkerResetOrigins();

  const next = enabled
    ? Arr.toSorted(Arr.uniq(Arr.toPushed(current, siteOrigin)), (a, b) =>
        a < b ? -1 : 1,
      )
    : current.filter((entry) => entry !== siteOrigin);

  await chrome.storage.local.set({ [storageKey]: next });

  return next;
};

const parseOrigins = (value: unknown): readonly string[] =>
  Arr.isArray(value)
    ? value.filter((entry) => typeof entry === 'string')
    : ([] as const);
