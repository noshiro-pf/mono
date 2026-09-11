import { Arr } from 'ts-data-forge';

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

  const value: unknown = stored[storageKey];

  return Arr.isArray(value)
    ? value.filter((entry) => typeof entry === 'string')
    : [];
};

export const setServiceWorkerResetOrigin = async (
  siteOrigin: string,
  enabled: boolean,
): Promise<readonly string[]> => {
  const current = await loadServiceWorkerResetOrigins();

  const next = enabled
    ? Arr.toSorted(
        Array.from(new Set(Arr.toPushed(current, siteOrigin))),
        (a, b) => (a < b ? -1 : 1),
      )
    : current.filter((entry) => entry !== siteOrigin);

  await chrome.storage.local.set({ [storageKey]: next });

  return next;
};
